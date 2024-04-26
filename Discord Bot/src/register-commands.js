require("dotenv").config();
const { REST, Routes, ApplicationCommandOptionType } = require("discord.js");

const commands = [
    {
        name: "oi",
        description: "Replies with Oi!",
    },
    {
        name: "random-map",
        description: "Replies random parkour map with given filters",
        options: [
            {
                name: "author-name",
                description: "Filter by author name",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
            {
                name: "mode",
                description: "Filter by mode",
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "Classic",
                        value: "Classic",
                    },
                    {
                        name: "Grapple",
                        value: "Grapple",
                    },
                    {
                        name: "VTOL",
                        value: "VTOL",
                    },
                    {
                        name: "Arrows",
                        value: "Arrows",
                    },
                ],
                required: false,
            },
            {
                name: "bonk-version",
                description: "Filter by bonk version",
                type: ApplicationCommandOptionType.String,
                choices: [
                    {
                        name: "Bonk 1",
                        value: "Bonk 1",
                    },
                    {
                        name: "Bonk 2",
                        value: "Bonk 2",
                    },
                ],
                required: false,
            },
            {
                name: "tags",
                description: "Filter by tags",
                type: ApplicationCommandOptionType.String,
                required: false,
            },
        ],
    },
];

const rest = new REST({ version: "10" }).setToken(process.env.BOT_TOKEN);

(async () => {
    try {
        console.log("Registering slash commands...");

        await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
            body: commands,
        });

        console.log("Successfully registered slash commands!");
    } catch (error) {
        console.error(error);
    }
})();
