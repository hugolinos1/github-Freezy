import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const MAILSEND_API_KEY = Deno.env.get('MAILSEND_API_KEY');

serve(async (req) => {
  try {
    const { email, type, verificationUrl } = await req.json();

    if (!email || !type || !verificationUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const response = await fetch('https://api.mailersend.com/v1/email', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${MAILSEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: {
          email: 'noreply@freezy-app.com',
          name: 'Freezy'
        },
        to: [{
          email,
          name: 'User'
        }],
        subject: type === 'login' ? 'Connexion à Freezy' : 'Inscription à Freezy',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #8EBEC9; text-align: center;">Freezy</h1>
            <p style="color: #666; text-align: center;">
              ${type === 'login' ? 'Connectez-vous' : 'Inscrivez-vous'} à votre compte Freezy
            </p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationUrl}" 
                 style="background-color: #8EBEC9; 
                        color: white; 
                        padding: 12px 24px; 
                        text-decoration: none; 
                        border-radius: 4px;
                        display: inline-block;">
                ${type === 'login' ? 'Se connecter' : "S'inscrire"}
              </a>
            </div>
            <p style="color: #999; text-align: center; font-size: 12px;">
              Ce lien expire dans 1 heure. Si vous n'avez pas demandé cet email, vous pouvez l'ignorer.
            </p>
          </div>
        `
      })
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Mailsend API error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to send email', details: error }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Server error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
});