/// <reference types="vite/client" />

declare module '@react-oauth/google' {
  export const GoogleOAuthProvider: React.FC<{ clientId: string; children: React.ReactNode }>;
  export const GoogleLogin: React.FC<{
    onSuccess: (credentialResponse: { credential?: string }) => void;
    onError?: () => void;
    theme?: string;
    shape?: string;
    size?: string;
    width?: string;
    text?: string;
  }>;
  export function useGoogleLogin(options: any): any;
}
