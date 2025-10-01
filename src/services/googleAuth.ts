declare global {
  interface Window {
    google: any;
    googleAuthCallback: (response: any) => void;
  }
}

export interface GoogleUser {
  id: string;
  name: string;
  email: string;
  picture: string;
}

class GoogleAuthService {
  private clientId: string;
  private isInitialized = false;

  constructor() {
    this.clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      // Load Google Identity Services script
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      
      script.onload = () => {
        if (window.google) {
          window.google.accounts.id.initialize({
            client_id: this.clientId,
            callback: this.handleCredentialResponse.bind(this),
          });
          this.isInitialized = true;
          resolve();
        } else {
          reject(new Error('Google Identity Services failed to load'));
        }
      };

      script.onerror = () => {
        reject(new Error('Failed to load Google Identity Services'));
      };

      document.head.appendChild(script);
    });
  }

  private handleCredentialResponse(response: any) {
    if (window.googleAuthCallback) {
      window.googleAuthCallback(response);
    }
  }

  async signIn(): Promise<GoogleUser> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    return new Promise((resolve, reject) => {
      window.googleAuthCallback = (response: any) => {
        try {
          const payload = JSON.parse(atob(response.credential.split('.')[1]));
          
          const user: GoogleUser = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
          };

          resolve(user);
        } catch (error) {
          reject(error);
        }
      };

      window.google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          window.google.accounts.id.renderButton(
            document.getElementById('google-signin-button'),
            {
              theme: 'outline',
              size: 'large',
              width: '100%',
            }
          );
        }
      });
    });
  }

  renderButton(elementId: string, options: any = {}) {
    if (!this.isInitialized) {
      console.warn('Google Auth not initialized');
      return;
    }

    const defaultOptions = {
      theme: 'outline',
      size: 'large',
      width: '100%',
      ...options,
    };

    window.google.accounts.id.renderButton(
      document.getElementById(elementId),
      defaultOptions
    );
  }
}

export const googleAuth = new GoogleAuthService();