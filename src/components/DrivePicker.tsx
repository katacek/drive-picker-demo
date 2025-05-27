import React, { useEffect, useRef, useState, useCallback } from 'react';
import '@googleworkspace/drive-picker-element';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'drive-picker': React.DetailedHTMLProps<
        React.HTMLAttributes<HTMLElement> & {
          'oauth-token'?: string;
          'developer-key'?: string;
          'client-id'?: string;
          'app-id'?: string;
          'view-id'?: string;
          'mime-types'?: string;
          'show-upload-view'?: boolean;
          'show-folders'?: boolean;
        },
        HTMLElement
      >;
    }
  }
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const DEVELOPER_KEY = import.meta.env.VITE_GOOGLE_DEVELOPER_KEY;
const APP_ID = import.meta.env.VITE_GOOGLE_APP_ID;

const DrivePicker = () => {
  const [oauthToken, setOauthToken] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [pickerToken, setPickerToken] = useState<string>('');
  const pickerRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    // Load Google OAuth script
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Event handler for picker response
  const handlePickerPicked = useCallback((event: Event) => {
    // @ts-ignore
    const data = event.detail;
    console.log('Picker picked:', data);
    if (data && data.docs && data.docs.length > 0) {
      setSelectedFile(data.docs[0]);
    }
  }, []);

  const handlePickerAuthenticated = useCallback((event: Event) => {
    // @ts-ignore
    const data = event.detail;
    console.log('Picker authenticated:', data);
    if (data && data.token) {
      setPickerToken(data.token);
    }
  }, []);
  
  const setPickerRef = useCallback((node: HTMLElement | null) => {
    if (pickerRef.current) {
      pickerRef.current.removeEventListener('picker:picked', handlePickerPicked);
      pickerRef.current.removeEventListener('picker:authenticated', handlePickerAuthenticated);
    }
    if (node) {
      node.addEventListener('picker:picked', handlePickerPicked);
      node.addEventListener('picker:authenticated', handlePickerAuthenticated);
    }
    pickerRef.current = node;
  }, [handlePickerPicked, handlePickerAuthenticated]);

  const handleAuth = async () => {
    try {
      // @ts-ignore
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: 'https://www.googleapis.com/auth/drive.file',
        callback: (response: any) => {
          if (response.access_token) {
            setOauthToken(response.access_token);
          }
        },
      });
      client.requestAccessToken();
    } catch (error) {
      console.error('Error during authentication:', error);
    }
  };

  return (
    <div>
      <button onClick={handleAuth}>Authenticate with Google</button>
      {oauthToken && (
        <drive-picker
          ref={setPickerRef}
          oauth-token={oauthToken}
          developer-key={DEVELOPER_KEY}
          client-id={CLIENT_ID}
          app-id={APP_ID}
          view-id="DOCS"
          show-upload-view={true}
          show-folders={true}
        ></drive-picker>
      )}
      {selectedFile && (
        <><div style={{ marginTop: '2rem', textAlign: 'left', background: '#222', padding: '1rem', border: '1px solid green', borderRadius: '8px' }}>
          <h3>Selected File Info</h3>
          <p><strong>Name:</strong> {selectedFile.name}</p>
          <p><strong>ID:</strong> {selectedFile.id}</p>
          <p><strong>MIME Type:</strong> {selectedFile.mimeType}</p>
          {selectedFile.url && (
            <p><strong>URL:</strong> <a href={selectedFile.url} target="_blank" rel="noopener noreferrer">Open File</a></p>
          )}
          {pickerToken && (
            <p><strong>Picker Token:</strong> {pickerToken}</p>
          )}
        </div><button
          style={{
            marginTop: '1rem',
            background: '#e57373',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer'
          }}
          onClick={() => setSelectedFile(null)}
        >
            Remove File
          </button></>
      )}
    </div>
  );
};

export default DrivePicker; 