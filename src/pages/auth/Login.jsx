import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../../services/auth.service';
import logo from '../../assets/images/logo.jpg';
import '../../assets/css/Login.css';

export default function Login() {
  const [identifiant, setIdentifiant] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await login({
        identifiant: identifiant.trim(),
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
        setError(err.response.data?.message || 'Identifiant ou mot de passe incorrect');
      } else if (err.request) {
        setError('Erreur réseau, veuillez réessayer');
      } else {
        setError('Une erreur inattendue est survenue');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* PANNEAU GAUCHE */}
      <div className="login-left-panel">
        <div className="login-left-content">
          <img src={logo} alt="Bouctou Poulet" className="login-logo" />
          <h1 className="login-brand">Bouctou-Poulet</h1>
          <p className="login-slogan">
            Poussins • Œufs • Poulets <br />
            <span className="login-highlight">Qualité & fraîcheur garanties</span>
          </p>
        </div>
      </div>

      {/* PANNEAU DROIT */}
      <div className="login-right-panel">
        <form className="login-card" onSubmit={handleSubmit}>
          <h2 className="login-title">Connexion</h2>
          
          {error && <div className="login-error">{error}</div>}

          {/* IDENTIFIANT */}
          <div className="input-group">
            <input
              type="text"
              placeholder="Identifiant"
              className="login-input"
              value={identifiant}
              onChange={(e) => setIdentifiant(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {/* MOT DE PASSE */}
          <div className="input-group password-group">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mot de passe"
              className="login-input password-input"
              value={motDePasse}
              onChange={(e) => setMotDePasse(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>

          <button 
            className={`login-button ${loading ? 'loading' : ''}`} 
            disabled={loading}
            type="submit"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <div className="login-footer">
            <p className="forgot-password">
              <a href="/bouctou_poulet/mot-de-passe-oublie">Mot de passe oublié ?</a>
            </p>
            <p className="contact-support">
              Problème de connexion ? <a href="mailto:support@bouctoupoulet.com">Contacter le support</a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}