import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import logo from '../../assets/images/logo.jpg';

export default function Login() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const response = await login({
      identifiant: identifiant.trim(), // trim pour éviter les espaces
      mot_de_passe: motDePasse.trim(),
    });

    if (response.data?.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem(
        'utilisateur',
        JSON.stringify(response.data.utilisateur)
      );
      navigate('/bouctou_poulet/admin/dashboard');
    } else {
      setError('Identifiant ou mot de passe incorrect');
    }
  } catch (err) {
    console.log('❌ Erreur login Axios :', err);

    if (err.response) {
      // Erreur renvoyée par le serveur
      setError(err.response.data?.message || 'Identifiant ou mot de passe incorrect');
    } else if (err.request) {
      // Pas de réponse du serveur
      setError('Erreur réseau, veuillez réessayer');
    } else {
      // Autres erreurs
      setError('Une erreur inattendue est survenue');
    }
  } finally {
    setLoading(false);
  }
};


  return (
    <div style={styles.container}>
      {/* PANNEAU GAUCHE */}
      <div style={styles.leftPanel}>
        <div style={styles.leftContent}>
          <img src={logo} alt="Bouctou Poulet" style={styles.logo} />
          <h1 style={styles.brand}>Bouctou-Poulet</h1>
          <p style={styles.slogan}>
            Poussins • Œufs • Poulets <br />
            <span style={styles.highlight}>Qualité & fraîcheur garanties</span>
          </p>
        </div>
      </div>

      {/* PANNEAU DROIT */}
      <div style={styles.rightPanel}>
        <form style={styles.card} onSubmit={handleSubmit}>
          <h2 style={styles.title}>Connexion</h2>

          {error && <div style={styles.error}>{error}</div>}

          {/* IDENTIFIANT */}
          <input
            type="text"
            placeholder="Identifiant"
            style={styles.input}
            value={identifiant}
            onChange={(e) => setIdentifiant(e.target.value)}
            disabled={loading}
            required
          />

          {/* MOT DE PASSE (SIMPLE) */}
          <input
            type="password"
            placeholder="Mot de passe"
            style={styles.input}
            value={motDePasse}
            onChange={(e) => setMotDePasse(e.target.value)}
            disabled={loading}
            required
          />

          <button style={styles.button} disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ================= STYLES ================= */

const styles = {
  container: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    fontFamily: 'Inter, sans-serif',
  },

  /* GAUCHE */
  leftPanel: {
    flex: 1,
    background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
    color: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  leftContent: {
    textAlign: 'center',
    maxWidth: '420px',
  },

  logo: {
    width: '140px',
    background: '#fff',
    padding: '15px',
    borderRadius: '20px',
    marginBottom: '20px',
    boxShadow: '0 15px 40px rgba(0,0,0,0.25)',
  },

  brand: {
    fontSize: '2.6rem',
    fontWeight: '800',
  },

  slogan: {
    fontSize: '1.2rem',
    marginTop: '10px',
    lineHeight: '1.6',
  },

  highlight: {
    background: '#FBC02D',
    color: '#4E342E',
    padding: '6px 14px',
    borderRadius: '8px',
    display: 'inline-block',
    marginTop: '10px',
    fontWeight: '600',
  },

  /* DROITE */
  rightPanel: {
    flex: 1,
    background: '#FAFAFA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  card: {
    width: '100%',
    maxWidth: '420px',
    background: '#fff',
    padding: '40px',
    borderRadius: '20px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
  },

  title: {
    textAlign: 'center',
    color: '#2E7D32',
    marginBottom: '30px',
    fontSize: '1.8rem',
  },

  input: {
    width: '100%',
    padding: '15px',
    marginBottom: '20px',
    borderRadius: '12px',
    border: '2px solid #E0E0E0',
    fontSize: '1rem',
    outline: 'none',
  },

  button: {
    width: '100%',
    padding: '15px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #FBC02D, #FFEB3B)',
    fontWeight: '700',
    fontSize: '1rem',
    cursor: 'pointer',
  },

  error: {
    background: '#FFE5E5',
    color: '#C62828',
    padding: '10px',
    borderRadius: '10px',
    marginBottom: '15px',
    textAlign: 'center',
  },
};
