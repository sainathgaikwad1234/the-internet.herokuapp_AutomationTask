import { GologinApi } from 'gologin';
import puppeteer from 'puppeteer';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI2ODc3YTQxNTc4MmM0ZTA2YzY4MWI1ZjYiLCJ0eXBlIjoiZGV2Iiwiand0aWQiOiI2ODc3YTZjNGE4YjE1ODczOTYwYWFjMzYifQ.y2Fhl8SdYFmld61ncohEeJ5yKt_S2ZQ37NerMgzQOQo';
const gologin = GologinApi({ token });

function randomDelay(min = 300000, max = 900000) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function main() {
  const profile = await gologin.createProfileRandomFingerprint('MyProfile');
  const profileId = profile.id;
  await gologin.addGologinProxyToProfile(profileId, 'US');

  const { browser: glBrowser } = await gologin.launch({ profileId });
  const browser = await puppeteer.connect({ browserWSEndpoint: glBrowser.wsEndpoint });

  const [connectionsTab, messagesTab, grokTab] = await Promise.all([
    browser.newPage(),
    browser.newPage(),
    browser.newPage(),
  ]);

  // Load all tabs
  await connectionsTab.goto('https://www.linkedin.com/search/results/people/', { waitUntil: 'networkidle2' });
  await messagesTab.goto('https://www.linkedin.com/messaging/', { waitUntil: 'networkidle2' });
  await grokTab.goto('https://grok.openai.com/', { waitUntil: 'networkidle2' });

  console.log('Tabs loaded. Starting automation...');

  for (let i = 0; i < 5; i++) {
    console.log(`🔁 Loop ${i + 1}`);

    // Step 1: Pick next profile from LinkedIn search
    const profiles = await connectionsTab.$$('a.app-aware-link');
    const profileLink = await profiles[i]?.evaluate(el => el.href);
    if (!profileLink) break;

    console.log(`🧑 Visiting: ${profileLink}`);
    const profilePage = await browser.newPage();
    await profilePage.goto(profileLink, { waitUntil: 'networkidle2' });
    await profilePage.waitForTimeout(3000);

    const profileText = await profilePage.evaluate(() => {
      return document.body.innerText.slice(0, 2500);
    });
    await profilePage.close();

    console.log(`📋 Copied profile text (${profileText.length} chars)`);

    // Step 2: Go to Grok tab, paste profileText, get response
    await grokTab.bringToFront();
    const inputBox = await grokTab.$('textarea');
    await inputBox.click({ clickCount: 3 });
    await inputBox.type(`Please write a LinkedIn connection request under 100 words for:\n\n${profileText}\n\nInvite them to https://medfuelai.eventbrite.com`, { delay: 10 });

    await grokTab.keyboard.press('Enter');
    console.log('✉️ Prompt sent to Grok');

    // Wait for Grok response to load
    await delay(8000);

    const message = await grokTab.evaluate(() => {
      const bubbles = Array.from(document.querySelectorAll('.markdown'));
      return bubbles.pop()?.innerText || 'Hi, I’d like to connect!';
    });

    console.log(`📝 Generated Message: ${message}`);

    // Step 3: Send connection request
    const connectTab = await browser.newPage();
    await connectTab.goto(profileLink, { waitUntil: 'networkidle2' });

    try {
      const [connectBtn] = await connectTab.$x("//button[contains(text(), 'Connect')]");
      if (connectBtn) {
        await connectBtn.click();
        await connectTab.waitForSelector('button[aria-label="Add a note"]', { timeout: 5000 });
        await connectTab.click('button[aria-label="Add a note"]');
        await connectTab.type('textarea[name="message"]', message);
        await connectTab.click('button[aria-label="Send now"]');
        console.log('✅ Connection sent.');
      } else {
        console.log('⚠️ Already connected or button not found.');
      }
    } catch (err) {
      console.error('❌ Error sending connection:', err.message);
    }

    await connectTab.close();

    // Step 4: Message 1st-degree connection (optional basic flow)
    await messagesTab.bringToFront();
    const chatList = await messagesTab.$$('li.msg-conversations-container__convo-item');
    if (chatList.length > i) {
      await chatList[i].click();
      await messagesTab.waitForTimeout(2000);

      const msgInput = await messagesTab.$('div.msg-form__contenteditable');
      if (msgInput) {
        await msgInput.type(`Hey! Just reaching out as part of our AI-in-oncology network. Here’s our event: https://medfuelai.eventbrite.com`, { delay: 20 });
        await messagesTab.keyboard.press('Enter');
        console.log('💬 Message sent to 1st-degree connection.');
      }
    }

    // Step 5: Wait randomly before next
    const waitTime = randomDelay();
    console.log(`🕒 Waiting ${Math.floor(waitTime / 1000)} seconds...`);
    await delay(waitTime);
  }

  await browser.close();
  await gologin.stop();
  await gologin.deleteProfile(profileId);
  console.log('✅ Automation complete. Browser closed.');
}

main().catch(console.error);
