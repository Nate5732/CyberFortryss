import { NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: Request) {
  try {
    const { email, moduleName, token, townshipName } = await request.json()

    const trainingUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/training/take?token=${token}`

    const { data, error } = await resend.emails.send({
      from: 'CyberFortRYSS <noreply@cyberfortryss.com>',
      to: email,
      subject: `${townshipName} - Cyber Awareness Training Assignment`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border-radius: 0 0 10px 10px;
              }
              .button {
                display: inline-block;
                background: #000;
                color: white;
                padding: 15px 30px;
                text-decoration: none;
                border-radius: 5px;
                margin: 20px 0;
                font-weight: bold;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                font-size: 12px;
                color: #666;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>🔒 Cyber Awareness Training</h1>
            </div>
            <div class="content">
              <h2>Hello!</h2>
              <p>You have been assigned the following training module:</p>
              <p><strong>${moduleName}</strong></p>
              <p>This training is required for ${townshipName}. Please complete it at your earliest convenience.</p>
              
              <div style="text-align: center;">
                <a href="${trainingUrl}" class="button">
                  Start Training →
                </a>
              </div>
              
              <p><small>Or copy and paste this link into your browser:</small></p>
              <p style="word-break: break-all; font-size: 12px; color: #666;">
                ${trainingUrl}
              </p>
              
              <p style="margin-top: 30px;">
                <strong>What to expect:</strong>
              </p>
              <ul>
                <li>Watch the training video</li>
                <li>Complete a short quiz</li>
                <li>Your results will be recorded automatically</li>
              </ul>
            </div>
            <div class="footer">
              <p>This is an automated message from ${townshipName} Cyber Awareness Training.</p>
              <p>If you believe you received this email in error, please contact your administrator.</p>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Send email error:', error)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }
}