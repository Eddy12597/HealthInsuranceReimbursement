## Health Insurance Reimbursement

An elderly friendly WeChat MiniProgram to request the reimbursement rate of medicine.

<table>
  <tr>
    <td align="center">
      <img width="387" height="795" alt="image" src="https://github.com/user-attachments/assets/a2c11510-0b4f-44e3-8e33-c23fdec13932" />
      <p><em>Index page with login button, lookup page, favorites page, and ai chat page</em></p>
    </td>
    <td align="center">
      <img width="380" height="768" alt="Automatic search completion" src="https://github.com/user-attachments/assets/97d29438-da3d-4310-a98b-bc6cb14ea3ef"/>
      <p><em>Automatic search completion with name initials</em></p>
    </td>
    <td align="center">
      <img width="383" height="771" alt="Save to favorites" src="https://github.com/user-attachments/assets/ca66a9cc-0cab-4626-bda9-9b19c2ca3a28"/>
      <p><em>Save to favorites (mock localhost server for now)</em></p>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img width="384" height="723" alt="Show favorites" src="https://github.com/user-attachments/assets/b51d79a2-0035-4d77-8dfa-8fdf738946a4"/>
      <p><em>Show favorites (mock localhost server for now)</em></p>
    </td>
    <td align="center">
      <img width="381" height="794" alt="image" src="https://github.com/user-attachments/assets/bbcdb932-3585-4014-8a2b-b56217e8b5a5" />
      <p><em>AI ChatBot for advanced help</em></p>
    </td>
    <td align="center>
      <img width="382" height="748" alt="image" src="https://github.com/user-attachments/assets/0b6a2623-d17d-4f55-a915-362b6a7ef0ba" />
      <p><em>AI ChatBot for advanced help</em></p>
    </td>
  </tr>
</table>


### How to use:
#### Frontend:
1. Open up [WeChat Dev Tools](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. create a `config.js` file in the project root folder
3. add the following lines to `config.js`, replacing `YOUR_API_KEY` with your deepseek api key:
```javascript
module.exports = {
  DEEPSEEK_API_KEY: 'YOUR_API_KEY'
};
```
4. Click 'compile' on the top menu
5. Click 'preview' on the top menu
#### Backend (localhost server):
```bash
cd server/src
node server_drugs.js
# open up a new terminal window, then
node server_favorites.js
```


### Todos:

1. Find API endpoint (should have drug name, drug reimbursement rate, and a short description for extra info).
2. Research more about reimbursement rates & relation with insurance plans
3. Find backend host for favorites storage
4. See if WeiXin has built-in login api / complete server side code for login
5. Register App on Tencent Cloud or something
6. ~~Add AI Chatbot feature (may require RAG / fine tuning??) -> @Clark (Done)~~
5. ~~Maybe add the server-side code as well, but that would mess up the npm build in wc dev tools (Done)~~
6. ~~Update README.md to include screenshots and stuff (Done)~~
