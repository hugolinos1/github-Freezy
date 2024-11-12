import { SignJWT, jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(import.meta.env.VITE_JWT_SECRET || 'your-jwt-secret');
const isDevelopment = !import.meta.env.VITE_MAILSEND_API_KEY || 
                     import.meta.env.MODE === 'development';

export async function sendAuthEmail(email: string, type: 'login' | 'signup'): Promise<void> {
  const token = await new SignJWT({ email, type })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('1h')
    .sign(JWT_SECRET);

  const verificationUrl = `${window.location.origin}/verify?token=${token}`;

  if (isDevelopment) {
    console.log('Mode développement: Simulation d\'envoi d\'email');
    console.log('URL de vérification:', verificationUrl);
    
    const pendingLogins = JSON.parse(localStorage.getItem('pendingLogins') || '[]');
    pendingLogins.push({
      email,
      token,
      type,
      timestamp: Date.now()
    });
    localStorage.setItem('pendingLogins', JSON.stringify(pendingLogins));
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setTimeout(() => {
      window.location.href = verificationUrl;
    }, 2000);
    
    return;
  }

  const response = await fetch('https://your-project-ref.supabase.co/functions/v1/handle_email_send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${import.meta.env.VITE_MAILSEND_API_KEY}`
    },
    body: JSON.stringify({
      email,
      type,
      verificationUrl
    })
  });

  if (!response.ok) {
    const error = await response.json();
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    throw new Error(`Service d'email indisponible: ${error.message || 'Erreur inconnue'}`);
  }
}

export async function verifyAuthToken(token: string): Promise<{ email: string; type: 'login' | 'signup' }> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as { email: string; type: 'login' | 'signup' };
  } catch (error) {
    console.error('Erreur de vérification du token:', error);
    throw new Error('Token invalide ou expiré');
  }
}