#!/usr/bin/env node

const readline = require('readline');
const { exec } = require('node:child_process');
const { Configuration, OpenAIApi } = require('openai');
const { config } = require('dotenv');
config();
const figlet = require("figlet");

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log(figlet.textSync("Git GPT"));


async function generateGitCommand(prompt) {
    const request = {
        max_tokens: 100,
        temperature: 0.2,
        model:"gpt-3.5-turbo",
        messages: [
            {"role": "system", "content": `You are a helpful assistant. Output a git command only from the following conversation, no explanation or other text: ${prompt}`},
        ]
    }
    const response = await openai.createChatCompletion(request);

    return response.data.choices[0].message.content;
}

rl.setPrompt('Describe what you would like to do with Git?\n ');
rl.prompt();

rl.on('line', async (input) => {
    const command = await generateGitCommand(input);

    console.log("Git command: ", command);

    rl.question(`Are you sure you want to execute the following command: ${command} (y/n)? `, (answer) => {
      if (answer.toLowerCase() === 'y') {
        exec(command, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error executing command: ${error.message}`);
            console.log(stderr);
          } else {
            console.log(stdout);
          }
          rl.prompt();
        });
      } else {
        console.log('Command execution cancelled.');
        rl.prompt();
      }
    });
  });