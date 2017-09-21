import { sendToLog } from '../system/modlog'
import { addNewName } from '../handlers/update'

module.exports = {
  name: 'guildMemberUpdate',
  type: 'guildMemberUpdate',
  toggleable: true,
  run: function (bot, raw) {
    let guild = raw.guild
    let member = raw.member
    let oldMember = raw.oldMember
    let obj = {
      guildID: guild.id,
      type: `Unknown Role Change`,
      changed: `► Name: **${member.username}#${member.discriminator}**`,
      color: 8351671,
      against: member
    }
    if (member.roles.length !== oldMember.roles.length) {
      guild.getAuditLogs(1, null, 25).then((log) => {
        log.entries[0].guild = []
        let user
        if (log.users.length === 1) {
          user = log.users[0]
        } else {
          user = log.users.filter(u => u.id !== member.id)[0] // order provided isn't always consistent
        }
        let key = Object.keys(log.entries[0].after)[0]
        let role
        if (oldMember.roles.length > member.roles.length) {
          oldMember.roles.forEach((r, index) => {
            if (member.roles.indexOf(r) === -1) {
              role = r
            }
          })
        } else {
          member.roles.forEach((r, index) => {
            if (oldMember.roles.indexOf(r) === -1) {
              role = r
            }
          })
        }
        role = guild.roles.get(role)
        if (key === '$add') {
          key = 'Added'
        } else {
          key = 'Removed'
        }
        obj = {
          guildID: guild.id,
          type: `${key} Role`,
          changed: `► Name: **${member.username}#${member.discriminator}**\n► Role ${key}: **${role.name}**\n► Role ID: **${role.id}**`,
          color: 8351671,
          against: member
        }
        obj.footer = {
          text: `${key} by ${user.username}#${user.discriminator}`,
          icon_url: `${user.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://cdn.discordapp.com/embed/avatars/${user.discriminator % 5}.png`}`
        }
        sendToLog(bot, obj)
      }).catch(() => {
        obj.footer = {
          text: 'I cannot view audit logs!',
          icon_url: 'http://www.clker.com/cliparts/C/8/4/G/W/o/transparent-red-circle-hi.png'
        }
        sendToLog(bot, obj)
      })
    } else if (member.nick !== oldMember.nick) {
      if (member.nick) {
        addNewName(member.id, member.nick)
      }
      sendToLog(bot, {
        guildID: guild.id,
        type: 'Nickname Changed',
        changed: `► Now: **${member.nick ? member.nick : member.username}#${member.discriminator}**\n► Was: **${oldMember.nick ? oldMember.nick : member.username}#${member.discriminator}**\n► ID: **${member.id}**`,
        color: 8351671,
        against: member
      })
    }
  }
}
