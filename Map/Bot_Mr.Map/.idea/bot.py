## author: Char Song
import discord
import responses

async def send_message(message, user_message):
    try:
        response = responses.handle_response(user_message)
        await message.channel.send(responses)
    except Exception as e:
        print(e)

    def run_discord_bot():
        TOKEN = 'MTE3NTI5MjEzNjMzMDEwNDkwMw.G4824D.NxWaFHK7fk9bA2rYG6yFB1aeG3VD88mionGLjM'
        client = discord.Client()

        @client.event
        async def on_ready():
            print(f'{client.user} is no running')

        client.run(TOKEN)