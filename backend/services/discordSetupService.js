const { ChannelType, PermissionFlagsBits } = require('discord.js')

/**
 * Auto-setup Discord server with channels and permissions
 * @param {Guild} guild - Discord guild object
 * @param {Role} betaRole - Beta Tester role
 * @returns {Promise<Object>}
 */
const autoSetupDiscordServer = async (guild, betaRole) => {
  try {
    console.log('🔧 [DISCORD SETUP] Starting auto-setup...')
    
    const everyoneRole = guild.roles.everyone
    const results = {
      success: true,
      channelsCreated: [],
      categoriesCreated: [],
      messagesPosted: [],
      errors: [],
    }

    // ============================================
    // STEP 1: Create Categories
    // ============================================
    
    console.log('📁 [DISCORD SETUP] Creating categories...')
    
    // Landing Category
    let landingCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase() === 'landing'
    )
    
    if (!landingCategory) {
      landingCategory = await guild.channels.create({
        name: '🚪 Landing',
        type: ChannelType.GuildCategory,
        position: 0,
      })
      results.categoriesCreated.push('Landing')
      console.log('   ✅ Created: Landing category')
    }

    // Beta Channels Category
    let betaCategory = guild.channels.cache.find(
      c => c.type === ChannelType.GuildCategory && c.name.toLowerCase().includes('beta')
    )
    
    if (!betaCategory) {
      betaCategory = await guild.channels.create({
        name: '🐝 Beta Channels',
        type: ChannelType.GuildCategory,
        position: 1,
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: betaRole.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.ReadMessageHistory,
            ],
          },
        ],
      })
      results.categoriesCreated.push('Beta Channels')
      console.log('   ✅ Created: Beta Channels category')
    }

    // ============================================
    // STEP 2: Create Welcome Channel
    // ============================================
    
    console.log('🚪 [DISCORD SETUP] Creating welcome channel...')
    
    let welcomeChannel = guild.channels.cache.find(
      c => c.type === ChannelType.GuildText && 
           (c.name === 'welcome' || c.name === 'verify-here')
    )
    
    if (!welcomeChannel) {
      welcomeChannel = await guild.channels.create({
        name: 'welcome',
        type: ChannelType.GuildText,
        parent: landingCategory?.id,
        topic: '🐝 New to Helwa AI? Start here! Verify your account to access beta channels.',
        permissionOverwrites: [
          {
            id: everyoneRole.id,
            allow: [PermissionFlagsBits.ViewChannel],
            deny: [
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.AddReactions,
              PermissionFlagsBits.CreatePublicThreads,
              PermissionFlagsBits.CreatePrivateThreads,
            ],
          },
          {
            id: betaRole.id,
            deny: [PermissionFlagsBits.ViewChannel], // Verified users don't need to see this
          },
          {
            id: guild.members.me.roles.botRole?.id || guild.members.me.id,
            allow: [
              PermissionFlagsBits.ViewChannel,
              PermissionFlagsBits.SendMessages,
              PermissionFlagsBits.EmbedLinks,
              PermissionFlagsBits.MentionEveryone,
            ],
          },
        ],
      })
      results.channelsCreated.push('welcome')
      console.log('   ✅ Created: #welcome')
    }

    // ============================================
    // STEP 3: Create Beta Channels
    // ============================================
    
    console.log('📢 [DISCORD SETUP] Creating beta channels...')
    
    const betaChannels = [
      {
        name: 'announcements',
        topic: '📢 Important updates and announcements from the Helwa AI team',
        slowmode: 0,
      },
      {
        name: 'beta-signals',
        topic: '📊 Real-time ethical trading signals powered by AI',
        slowmode: 0,
      },
      {
        name: 'beta-discussion',
        topic: '💬 General discussion for beta testers - share your thoughts and experiences!',
        slowmode: 0,
      },
      {
        name: 'bug-reports',
        topic: '🐛 Found a bug? Report it here! Please include steps to reproduce.',
        slowmode: 60, // 1 minute slowmode
      },
      {
        name: 'support',
        topic: '🆘 Need help? Ask questions here and our team will assist you!',
        slowmode: 0,
      },
    ]

    for (const channelConfig of betaChannels) {
      let channel = guild.channels.cache.find(
        c => c.type === ChannelType.GuildText && c.name === channelConfig.name
      )
      
      if (!channel) {
        channel = await guild.channels.create({
          name: channelConfig.name,
          type: ChannelType.GuildText,
          parent: betaCategory?.id,
          topic: channelConfig.topic,
          rateLimitPerUser: channelConfig.slowmode,
          permissionOverwrites: [
            {
              id: everyoneRole.id,
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: betaRole.id,
              allow: [
                PermissionFlagsBits.ViewChannel,
                PermissionFlagsBits.SendMessages,
                PermissionFlagsBits.ReadMessageHistory,
                PermissionFlagsBits.AddReactions,
                PermissionFlagsBits.AttachFiles,
                PermissionFlagsBits.EmbedLinks,
              ],
            },
          ],
        })
        results.channelsCreated.push(channelConfig.name)
        console.log(`   ✅ Created: #${channelConfig.name}`)
      }
    }

    // ============================================
    // STEP 4: Post Welcome Message
    // ============================================
    
    console.log('📝 [DISCORD SETUP] Posting welcome message...')
    
    if (welcomeChannel) {
      // Check if welcome message already exists
      const messages = await welcomeChannel.messages.fetch({ limit: 10 })
      const hasWelcomeMessage = messages.some(m => 
        m.author.id === guild.members.me.id && 
        m.content.includes('Welcome to Helwa AI Beta')
      )
      
      if (!hasWelcomeMessage) {
        const welcomeMessage = await welcomeChannel.send({
          content: `# 🐝 Welcome to Helwa AI Beta!\n\n` +
            `**Thank you for joining!** To access the beta channels and start receiving trading signals, please verify your account.\n\n` +
            `---\n\n` +
            `## 📋 How to Verify in 3 Steps:\n\n` +
            `### 1️⃣ Check Your DMs\n` +
            `Our bot has sent you a **Direct Message** with verification instructions.\n\n` +
            `> 💡 **Don't see the DM?** Check your **Message Requests** folder (top left in Discord)\n\n` +
            `### 2️⃣ Get Your Verification Code\n` +
            `- Go to your dashboard: **https://helwa.ai/dashboard**\n` +
            `- Click **"Generate Discord Invite"** (if you haven't already)\n` +
            `- **Copy the verification code** from the yellow box\n` +
            `  - Format: \`discord_xxxxxxxxxxxxxxxxx\`\n\n` +
            `### 3️⃣ Send Code to Bot\n` +
            `- Open the DM from the bot\n` +
            `- **Paste ONLY the verification code** (nothing else)\n` +
            `- Bot will verify you and assign the **Beta Tester** role ✅\n\n` +
            `---\n\n` +
            `## ✅ After Verification\n\n` +
            `Once verified, you'll instantly see:\n` +
            `- 📊 **#beta-signals** - Real-time trading signals\n` +
            `- 💬 **#beta-discussion** - Chat with other testers\n` +
            `- 📢 **#announcements** - Important updates\n` +
            `- 🐛 **#bug-reports** - Report issues\n` +
            `- ℹ️ **#support** - Get help\n\n` +
            `---\n\n` +
            `## 🚨 Troubleshooting\n\n` +
            `**❌ "I don't see a DM from the bot"**\n` +
            `1. User Settings → Privacy & Safety\n` +
            `2. Enable: "Allow direct messages from server members"\n` +
            `3. Leave this server and rejoin using your invite link\n\n` +
            `**❌ "I lost my verification code"**\n` +
            `Go to **https://helwa.ai/dashboard** - the code is displayed in Step 2\n\n` +
            `**❌ "The bot says my code is invalid"**\n` +
            `- Send the **entire code** (starts with \`discord_\`)\n` +
            `- Use the **Copy button** on the dashboard\n` +
            `- Send **ONLY the code** (no extra text)\n\n` +
            `---\n\n` +
            `⏳ **Please complete verification within 24 hours** to maintain your beta spot!\n\n` +
            `🆘 **Need help?** Tag an admin or email support@helwa.ai`,
        })
        
        // Pin the message
        await welcomeMessage.pin()
        results.messagesPosted.push('Welcome message in #welcome')
        console.log('   ✅ Posted and pinned welcome message')
      } else {
        console.log('   ℹ️  Welcome message already exists')
      }
    }

    // ============================================
    // STEP 5: Summary
    // ============================================
    
    console.log('✅ [DISCORD SETUP] Auto-setup complete!')
    console.log(`   → Categories created: ${results.categoriesCreated.length}`)
    console.log(`   → Channels created: ${results.channelsCreated.length}`)
    console.log(`   → Messages posted: ${results.messagesPosted.length}`)
    
    if (welcomeChannel) {
      console.log(`   → Welcome Channel ID: ${welcomeChannel.id}`)
      console.log(`   → Add to .env: DISCORD_WELCOME_CHANNEL_ID=${welcomeChannel.id}`)
    }

    return {
      success: true,
      welcomeChannelId: welcomeChannel?.id,
      ...results,
    }
    
  } catch (error) {
    console.error('❌ [DISCORD SETUP] Auto-setup failed:', error)
    return {
      success: false,
      error: error.message,
    }
  }
}

module.exports = {
  autoSetupDiscordServer,
}

