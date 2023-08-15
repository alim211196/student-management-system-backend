// birthdayEmailTemplate.js

const generateBirthdayEmailTemplate = (username, age) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        .email-container {
          background-color: #FFF;
          border: 1px solid #E7EBF0;
          border-radius: 10px;
          color: #000;
          padding: 16px;
          font-family: Arial, sans-serif;
        }

        .header {
          font-size: 24px;
          margin-bottom: 20px;
        }

        .image-container {
          text-align: center;
        }

        .birthday-image {
          max-width: 100%;
          height: auto;
        }
      </style>
    </head>
    <body>
      <div class="email-container">
        <h1 class="header">StudentsTracker</h1>
        <p class="title">Dear ${username},</p>
          <p class="title">Warmest wishes on your ${age}th birthday! 🎉</p>
            <p class="title">May your special day be filled with joy, laughter, and unforgettable moments.
             As you celebrate another year of life, may your heart be filled with happiness and your
              path ahead be adorned with success and fulfillment.</p>
              <p class="title">Happy ${age}th Birthday, ${username}! May your journey be blessed with love,
               prosperity, and all the wonderful things life has to offer.</p>
        <div class="image-container">
          <img class="birthday-image" src="${"https://birthdaycake24.com/uploads/worigin/2017/02/18/name-on-birthday-cake58a78dd85a1cf_c7aa32baa53417e93cc6efbd2adfaf44.jpg"}" alt="Birthday Cake" />
        </div>
        <br/>
        <br/>
        <p class="title">Best regards,</p>
        <p class="title">The StudentsTracker Team,</p>
      </div>
    </body>
    </html>
  `;
};

module.exports = generateBirthdayEmailTemplate;
