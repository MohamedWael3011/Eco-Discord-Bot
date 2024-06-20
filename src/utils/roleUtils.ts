import { Guild, Snowflake } from "discord.js";

/**
 * Removes a role from a guild.
 * @param {Guild} guild The guild from which to remove the role.
 * @param {Snowflake} roleId The ID of the role to remove.
 * @returns {Promise<void>} A Promise that resolves once the role is removed.
 */
export async function removeRoleFromGuild(guild, roleId) {
    try {
        // Fetch the role object from the guild
        const roleToRemove = await guild.roles.fetch(roleId);

        // Check if the role exists
        if (roleToRemove) {
            // Remove the role from the guild
            await roleToRemove.delete();
            console.log(`Role with ID ${roleId} successfully removed from guild ${guild.id}`);
        } else {
            console.log(`Role with ID ${roleId} not found in guild ${guild.id}`);
        }
    } catch (error) {
        console.error(`Error removing role from guild: ${error}`);
    }
}