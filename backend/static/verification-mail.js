function VerificationMail(name, URL) {
  return `
  <head>
    <title></title>
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style type="text/css">
      #outlook a {
        padding: 0;
      }
      .ReadMsgBody {
        width: 100%;
      }
      .ExternalClass {
        width: 100%;
      }
      .ExternalClass * {
        line-height: 100%;
      }
      body {
        margin: 0;
        padding: 0;
        -webkit-text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
      }
      table,
      td {
        border-collapse: collapse;
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }
      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }
      p {
        display: block;
        margin: 13px 0;
      }
    </style>
    <style type="text/css">
      @media only screen and (max-width: 480px) {
        @-ms-viewport {
          width: 320px;
        }
        @viewport {
          width: 320px;
        }
      }
    </style>

    <link
      href="https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700"
      rel="stylesheet"
      type="text/css"
    />
    <style type="text/css">
      @import url(https://fonts.googleapis.com/css?family=Ubuntu:300,400,500,700);
    </style>
    <style type="text/css">
      @media only screen and (min-width: 480px) {
        .mj-column-per-100,
        * [aria-labelledby="mj-column-per-100"] {
          width: 100% !important;
        }
      }
    </style>
  </head>
  <body style="background: #f9f9f9">
    <div style="background-color: #f9f9f9">
      <style type="text/css">
        html,
        body,
        * {
          -webkit-text-size-adjust: none;
          text-size-adjust: none;
        }
        a {
          color: #1eb0f4;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>

      <div
        style="
          max-width: 640px;
          margin: 0 auto;
          box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          overflow: hidden;
        "
      >
        <div
          style="
            margin: 12px auto;
            max-width: 640px;
            background: #7289da
              url(https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png)
              top center / cover no-repeat;
          "
        >
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="
              font-size: 0px;
              width: 100%;
              background: #7289da
                url(https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png)
                top center / cover no-repeat;
            "
            align="center"
            border="0"
            background="https://cdn.discordapp.com/email_assets/f0a4cc6d7aaa7bdf2a3c15a193c6d224.png"
          >
            <tbody>
              <tr>
                <td
                  style="
                    text-align: center;
                    vertical-align: top;
                    direction: ltr;
                    font-size: 0px;
                    padding: 57px;
                  "
                >
                  <div
                    style="
                      cursor: auto;
                      color: white;
                      font-family: Whitney, Helvetica Neue, Helvetica, Arial,
                        Lucida Grande, sans-serif;
                      font-size: 36px;
                      font-weight: 600;
                      line-height: 36px;
                      text-align: center;
                    "
                  >
                    Welcome to Pigeon Chat!
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style="margin: 0px auto; max-width: 640px; background: #ffffff">
          <table
            role="presentation"
            cellpadding="0"
            cellspacing="0"
            style="font-size: 0px; width: 100%; background: #ffffff"
            align="center"
            border="0"
          >
            <tbody>
              <tr>
                <td
                  style="
                    text-align: center;
                    vertical-align: top;
                    direction: ltr;
                    font-size: 0px;
                    padding: 40px 70px;
                  "
                >
                  <div
                    aria-labelledby="mj-column-per-100"
                    class="mj-column-per-100 outlook-group-fix"
                    style="
                      vertical-align: top;
                      display: inline-block;
                      direction: ltr;
                      font-size: 13px;
                      text-align: left;
                      width: 100%;
                    "
                  >
                    <table
                      role="presentation"
                      cellpadding="0"
                      cellspacing="0"
                      width="100%"
                      border="0"
                    >
                      <tbody>
                        <tr>
                          <td
                            style="
                              word-break: break-word;
                              font-size: 0px;
                              padding: 0px 0px 20px;
                            "
                            align="left"
                          >
                            <div
                              style="
                                cursor: auto;
                                color: #737f8d;
                                font-family: Whitney, Helvetica Neue, Helvetica,
                                  Arial, Lucida Grande, sans-serif;
                                font-size: 16px;
                                line-height: 24px;
                                text-align: left;
                              "
                            >
                              <p>
                                <img
                                  src="https://cdn.discordapp.com/email_assets/127c95bbea39cd4bc1ad87d1500ae27d.png"
                                  alt="Party Wumpus"
                                  title="None"
                                  width="500"
                                  style="height: auto"
                                />
                              </p>

                              <h2
                                style="
                                  font-family: Whitney, Helvetica Neue, Helvetica,
                                    Arial, Lucida Grande, sans-serif;
                                  font-weight: 500;
                                  font-size: 20px;
                                  color: #4f545c;
                                  letter-spacing: 0.27px;
                                "
                              >
                                Hey ${name}!,
                              </h2>
                              <p>
                                Wowwee! Thanks for registering an account with
                                Pigeon Chat! You're the coolest person in all the
                                land.
                              </p>
                              <p>
                                Before we get started, we'll need to verify your
                                email.
                              </p>
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <td
                            style="
                              word-break: break-word;
                              font-size: 0px;
                              padding: 10px 25px;
                            "
                            align="center"
                          >
                            <table
                              role="presentation"
                              cellpadding="0"
                              cellspacing="0"
                              style="border-collapse: separate"
                              align="center"
                              border="0"
                            >
                              <tbody>
                                <tr>
                                  <td>
                                    <a
                                      href="${URL}"
                                      target="_blank"
                                      style="
                                        border: none;
                                        border-radius: 6px;
                                        color: white;
                                        cursor: auto;
                                        padding: 14px 18px;
                                        text-decoration: none;
                                        background: #7289da;
                                        line-height: 100%;
                                        font-family: Ubuntu, Helvetica, Arial, sans-serif;
                                        font-size: 15px;
                                      "
                                      align="center"
                                      valign="middle"
                                      bgcolor="#7289DA"
                                    >
                                        Verify Email
                                    </a>
                                  </td>
                                </tr>
                              </tbody>
                            </table>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!--[if mso | IE]>
        </td></tr></table>
        <![endif]-->
        <!--[if mso | IE]>
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="640" align="center" style="width:640px; max-width: 100vw;">
          <tr>
            <td style="line-height:0px;font-size:0px;mso-line-height-rule:exactly;">
        <![endif]-->
      </div>
      <div style="margin: 0px auto; max-width: 100vw; width: 640px; background: transparent">
        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          style="font-size: 0px; width: 100%; background: transparent"
          align="center"
          border="0"
        >
          <tbody>
            <tr>
              <td
                style="
                  text-align: center;
                  vertical-align: top;
                  direction: ltr;
                  font-size: 0px;
                  padding: 0px;
                "
              >
                <div
                  aria-labelledby="mj-column-per-100"
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    vertical-align: top;
                    display: inline-block;
                    direction: ltr;
                    font-size: 13px;
                    text-align: left;
                    width: 100%;
                  "
                >
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    border="0"
                  >
                    <tbody>
                      <tr>
                        <td style="word-break: break-word; font-size: 0px">
                          <div style="font-size: 1px; line-height: 12px">
                            &nbsp;
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div style="margin: 0px auto; max-width: 100vw; width: 640px; background: transparent">
        <table
          role="presentation"
          cellpadding="0"
          cellspacing="0"
          style="font-size: 0px; width: 100%; background: transparent"
          align="center"
          border="0"
        >
          <tbody>
            <tr>
              <td
                style="
                  text-align: center;
                  vertical-align: top;
                  direction: ltr;
                  font-size: 0px;
                  padding: 4px 0px 12px 0px;
                "
              >
                <div
                  aria-labelledby="mj-column-per-100"
                  class="mj-column-per-100 outlook-group-fix"
                  style="
                    vertical-align: top;
                    display: inline-block;
                    direction: ltr;
                    font-size: 13px;
                    text-align: left;
                    width: 100%;
                  "
                >
                  <table
                    role="presentation"
                    cellpadding="0"
                    cellspacing="0"
                    width="100%"
                    border="0"
                  >
                    <tbody>
                      <tr>
                        <td
                          style="
                            word-break: break-word;
                            font-size: 0px;
                            padding: 0px;
                          "
                          align="center"
                        >
                          <div
                            style="
                              cursor: auto;
                              color: #99aab5;
                              font-family: Whitney, Helvetica Neue, Helvetica,
                                Arial, Lucida Grande, sans-serif;
                              font-size: 12px;
                              line-height: 24px;
                              text-align: center;
                            "
                          >
                            Sent by Pigeon Chat •
                            <a
                              href="https://pigeon-chat.vercel.app"
                              style="color: #1eb0f4; text-decoration: none"
                              target="_blank"
                              >@pigeonchat</a
                            >
                          </div>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </body>
  `
}

module.exports = VerificationMail
