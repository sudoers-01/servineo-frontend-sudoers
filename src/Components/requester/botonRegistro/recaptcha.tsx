'use client';

import { useMemo, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';

interface ReCaptchaFormProps {
  onVerified?: (success: boolean) => void;
  sitekey?: string;
}

const ReCaptchaForm: React.FC<ReCaptchaFormProps> = ({ onVerified, sitekey }) => {
  const captchaRef = useRef<ReCAPTCHA>(null);

  const resolvedSiteKey = useMemo(() => sitekey || process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || '', [sitekey]);

  const verifyBackend = async (token: string) => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/signUp/verify-recaptcha`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      onVerified?.(data.success);
    } catch (err) {
      console.error('Error comunicando con backend:', err);
      onVerified?.(false);
    }
  };

  return (
    <div>
      {resolvedSiteKey ? (
        <ReCAPTCHA
          ref={captchaRef}
          sitekey={resolvedSiteKey}
          onChange={(token) => {
            if (token) {
              verifyBackend(token);
            }
          }}
          onExpired={() => {
            onVerified?.(false);
            captchaRef.current?.reset();
          }}
        />
      ) : (
        <div role="alert" aria-live="polite">
          No se encontró la clave de reCAPTCHA. Configure `NEXT_PUBLIC_RECAPTCHA_SITE_KEY` o pase `sitekey` como prop.
        </div>
      )}
    </div>
  );
};

export default ReCaptchaForm;
