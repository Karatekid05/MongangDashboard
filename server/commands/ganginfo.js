gang = new Gang({
    gangId: configGang.gangId,
    name: configGang.name,
    guildId: interaction.guild.id,
    channelId: configGang.channelId,
    roleId: configGang.roleId,
    points: 0,
    weeklyPoints: 0,
    memberCount: 0,
    totalMemberPoints: 0,
    weeklyMemberPoints: 0,
    messageCount: 0,
    weeklyMessageCount: 0,
    pointsBreakdown: {
        messageActivity: 0,
        gamer: 0,
        artAndMemes: 0,
        other: 0
    },
    weeklyPointsBreakdown: {
        messageActivity: 0,
        gamer: 0,
        artAndMemes: 0,
        other: 0
    }
}); 