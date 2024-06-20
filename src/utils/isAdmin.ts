export async function isAdmin(interaction) {
  const allowedUserIDs = [
    "951235147125129247",
    "368776198068895745",
  ];
  if (!allowedUserIDs.includes(interaction.user.id)) {
    await interaction.reply({
      content: "Sorry, only admins can use this command.",
      ephemeral: true,
    });
    return false;
  }
  return true;
}
