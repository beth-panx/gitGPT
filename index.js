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

rl.question('What do you want to do with Git?\n ', async (prompt) => {
  const request = {
    max_tokens: 100,
    temperature: 0.2,
    model:"gpt-3.5-turbo",
    messages: [
      {"role": "system", "content": `You are a helpful assistant. Output a git command only from the following conversation, no explanation or other text: ${prompt}`},
    ]
  }

  openai.createChatCompletion(request)
  .then((response) => {
    const gitCommand = response.data.choices[0].message.content;
    console.log("git command: ", response.data.choices[0].message.content);

    rl.question('Do you want to execute this Git command? (y/n)', (answer) => {
      if (answer === 'y') {
        exec(gitCommand, (error, stdout, stderr) => {
          if (error) {
            console.error(`exec error: ${error}`);
            console.error(`stderr: ${stderr}`)

            return;
          }
          console.log(`Git command executed! Message: ${stdout}`);
        });
      } else {
        console.log('Any other command?');
      }

      rl.close();
    });
  })
  .catch((err) => {
    console.log(err);
    rl.close();
  });
});

