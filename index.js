import { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [nameInput, setNameInput] = useState('');
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nameInput || !file) {
      setMessage('Bitte Vorname, Nachname und Bild angeben.');
      return;
    }

    const [vorname, nachname] = nameInput.split(',').map(s => s.trim().toLowerCase());
    if (!vorname || !nachname) {
      setMessage('Format: Vorname, Nachname');
      return;
    }

    const extension = file.name.split('.').pop().toLowerCase();
    if (!['png', 'jpg', 'jpeg'].includes(extension)) {
      setMessage('Nur PNG oder JPG erlaubt.');
      return;
    }

    const fileName = `${vorname}_${nachname}_akteneintrag_bild.${extension}`;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('fileName', fileName);

    setLoading(true);
    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(`Bild erfolgreich hochgeladen: ${data.url}`);
      } else {
        setMessage(`Fehler: ${data.error}`);
      }
    } catch (err) {
      setMessage(`Fehler: ${err.message}`);
    }
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Landespolizei Aktenbilder Uploader</title>
      </Head>
      <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
        <h1>Landespolizei Aktenbilder Uploader</h1>
        <form onSubmit={handleSubmit}>
          <label>
            Vorname, Nachname:
            <input
              type="text"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              placeholder="z.B. Max, Mustermann"
              style={{ display: 'block', margin: '10px 0' }}
            />
          </label>
          <label>
            Bild hochladen (PNG/JPG):
            <input
              type="file"
              accept="image/png, image/jpeg"
              onChange={(e) => setFile(e.target.files[0])}
              style={{ display: 'block', margin: '10px 0' }}
            />
          </label>
          <button type="submit" disabled={loading}>
            {loading ? 'Lädt hoch...' : 'Hochladen'}
          </button>
        </form>
        {message && <p>{message}</p>}
      </div>
    </>
  );
}
