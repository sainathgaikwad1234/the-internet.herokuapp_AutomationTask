
import puppeteer from 'puppeteer-core';
import GoLogin from 'gologin';
import dotenv from 'dotenv';
dotenv.config();

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const humanType = async (element, text) => {
  for (const char of text) {
    await element.type(char);
    await delay(100 + Math.random() * 100);
  }
};

(async () => {
  const GL = new GoLogin({
    token: process.env.GOLOGIN_TOKEN,
    profile_id: process.env.GOLOGIN_PROFILE_ID, // your existing profile
  });

  const { wsUrl } = await GL.start();
  if (!wsUrl) throw new Error('Unable to get browser WebSocket URL');

  const browser = await puppeteer.connect({ browserWSEndpoint: wsUrl });

  // Maximize the browser window
  const [page] = await browser.pages();
  const session = await page.target().createCDPSession();
  const { width, height } = await page.evaluate(() => ({ width: window.screen.availWidth, height: window.screen.availHeight }));
  await session.send('Browser.setWindowBounds', {
    windowId: (await session.send('Browser.getWindowForTarget')).windowId,
    bounds: { width, height, windowState: 'normal' }
  });

  // Close all existing pages (sometimes GoLogin profile restores old tabs)
  const pages = await browser.pages();
  for (const page of pages) {
    await page.close();
  }

  // Now open fresh pages
  const [linkedinPage, grokPage] = await Promise.all([
    browser.newPage(),
    browser.newPage()
  ]);

  // Set viewport to maximize the page area
  await linkedinPage.setViewport({ width: 1920, height: 1080 });
  await grokPage.setViewport({ width: 1920, height: 1080 });

  // Go to LinkedIn
  await linkedinPage.goto('https://www.linkedin.com/', { waitUntil: 'networkidle2', timeout: 60000 });
  await linkedinPage.waitForSelector('[aria-label="Search"]');

  // Grok login
  await grokPage.goto('https://grok.com/');

  // Switch to LinkedIn tab before searching
  await linkedinPage.bringToFront();
  // 1. Search for "Ashish Kulkarni, thinkitive" on LinkedIn
  let searchInput = await linkedinPage.$('input[placeholder="Search"]');
  if (!searchInput) {
    searchInput = await linkedinPage.$('input[aria-label="Search"]');
  }
  if (!searchInput) {
    searchInput = await linkedinPage.$('input[role="combobox"]');
  }
  if (!searchInput) {
    throw new Error('Could not find LinkedIn search input!');
  }
  await searchInput.click({ clickCount: 3 });
  await searchInput.type('josh adams, Principal Software Engineer');
  await linkedinPage.keyboard.press('Enter');
  await linkedinPage.waitForNavigation({ waitUntil: 'networkidle2' });
  await delay(3000);

  // Switch to LinkedIn tab before getting the first profile
  await linkedinPage.bringToFront();
  // 2. Get the first profile link from search results
  let firstProfileUrl = await linkedinPage.$eval('a[href*="/in/"]', a => a.href);
  firstProfileUrl = firstProfileUrl.split('?')[0]; // Clean the URL
  console.log('Navigating to cleaned profile URL:', firstProfileUrl);
  await linkedinPage.screenshot({ path: 'before-profile-navigation.png' });

  // Switch to LinkedIn tab before visiting the profile
  await linkedinPage.bringToFront();
  // 3. Visit the first profile
  try {
    await linkedinPage.goto(firstProfileUrl, { waitUntil: 'load', timeout: 30000 });
  } catch (e) {
    console.warn('Navigation threw an error, but continuing:', e.message);
  }
  await delay(3000);

  // Switch to LinkedIn tab before extracting profile summary
  await linkedinPage.bringToFront();
  // 4. Extract profile data
  const profileData = await linkedinPage.evaluate(() => {
    const getText = (selector) => {
      const el = document.querySelector(selector);
      return el ? el.innerText.trim() : '';
    };
    const name = getText('.text-heading-xlarge, h1');
    const headline = getText('.text-body-medium.break-words');
    const location = getText('.text-body-small.inline.t-black--light.break-words');
    const about = getText('section.pv-about-section > p, .pv-shared-text-with-see-more span[aria-hidden="true"]');
    const experience = Array.from(document.querySelectorAll('#experience ~ .pvs-list__container li'))
      .slice(0, 2)
      .map(li => li.innerText.trim())
      .join('\n\n');
    const education = getText('#education ~ .pvs-list__container li');
    return {
      name,
      headline,
      location,
      about,
      experience,
      education
    };
  });
  // Build a summary string for Grok
  let profileSummary = `Name: ${profileData.name}\nHeadline: ${profileData.headline}\nLocation: ${profileData.location}\n`;
  if (profileData.about) profileSummary += `About: ${profileData.about}\n`;
  if (profileData.experience) profileSummary += `Experience:\n${profileData.experience}\n`;
  if (profileData.education) profileSummary += `Education: ${profileData.education}\n`;

  // Switch to Grok tab before writing the prompt
  console.log('Switching to Grok tab to write prompt...');
  await grokPage.bringToFront();
  await grokPage.waitForSelector('textarea');
  const prompt = `please provide a personalized connection request based on this profile under 100 words:\n${profileSummary}`;
  console.log('Writing prompt to Grok:', prompt);
  await grokPage.evaluate(() => { document.querySelector('textarea').value = ''; });
  await humanType(await grokPage.$('textarea'), prompt);
  await grokPage.keyboard.press('Enter');
  await delay(10000); // Wait for Grok's response

  // Switch to Grok tab before reading the response
  await grokPage.bringToFront();
  // 6. Get Grok's response
  const message = await grokPage.evaluate(() => {
    const bubbles = Array.from(document.querySelectorAll('.markdown, .message-response, .output-textarea, .chat-message'));
    return bubbles.pop()?.innerText || 'Hi, I’d like to connect!';
  });

  // Switch to LinkedIn tab before sending connection request
  await linkedinPage.bringToFront();
  // 7. Go back to LinkedIn profile and send connection request
  await delay(1000);

  try {
    // Click Connect
    const [connectBtn] = await linkedinPage.$x("//button[contains(text(), 'Connect')]");
    if (connectBtn) {
      await connectBtn.click();
      await linkedinPage.waitForSelector('button[aria-label="Add a note"]', { timeout: 5000 });
      await linkedinPage.click('button[aria-label="Add a note"]');
      await linkedinPage.waitForSelector('textarea[name="message"]');
      await linkedinPage.type('textarea[name="message"]', message);
      await linkedinPage.click('button[aria-label="Send now"]');
      console.log(`Connection request sent to ${firstProfileUrl}`);
    } else {
      console.log('Connect button not found or already connected.');
    }
  } catch (e) {
    console.log(`Failed to connect to ${firstProfileUrl}: ${e.message}`);
  }
})();
