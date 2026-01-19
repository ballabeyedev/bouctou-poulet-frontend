// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  LogOut,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import logo from '../../assets/images/logo.jpg';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('Accueil');
  const API_URL = 'https://bouctou-poulet-back-mali.onrender.com';
  const [produits, setProduits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // États pour la pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  
  // États pour les modales
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showModifModal, setShowModifModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // États pour le formulaire
  const [formData, setFormData] = useState({
    nom: '',
    type: '',
    prix: '',
    stock: '',
    description: '',
    image: null
  });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const utilisateur = localStorage.getItem('utilisateur');

    if (!token || !utilisateur) {
      navigate('/bouctou_poulet/login');
      return;
    }

    try {
      setUser(JSON.parse(utilisateur));
    } catch (err) {
      console.error('Erreur lors du parsing de l\'utilisateur:', err);
      localStorage.clear();
      navigate('/bouctou_poulet/login');
    }
  }, [navigate]);

  // Récupération des produits
  const fetchProduits = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/bouctou_poulet/login');
        return;
      }

      const response = await fetch(`${API_URL}/bouctou_poulet/admin/liste-produit`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/bouctou_poulet/login');
          return;
        }
        throw new Error(`Erreur ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Vérifier si data est un tableau
      if (Array.isArray(data)) {
        setProduits(data);
      } else if (data && Array.isArray(data.produits)) {
        setProduits(data.produits);
      } else if (data && data.data && Array.isArray(data.data)) {
        setProduits(data.data);
      } else {
        setProduits([]);
        console.warn('Format de données non reconnu:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      setError('Impossible de charger les produits. Veuillez réessayer.');
      setProduits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProduits();
  }, []);

  // Calcul des produits pour la pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = produits.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(produits.length / productsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Fonction pour obtenir la couleur en fonction du type
  const getTypeColor = (type) => {
    const typeLower = type?.toLowerCase();
    
    if (typeLower === 'oeuf') {
      return {
        background: '#fffaf0', // Blanc cassé/ivoire
        color: '#8B4513', // Marron pour le texte
        fontWeight: 'bold'
      };
    } else if (typeLower === 'poussin') {
      return {
        background: '#fffacd', // Jaune clair
        color: '#DAA520', // Or pour le texte
        fontWeight: 'bold'
      };
    } else if (typeLower === 'poulet') {
      return {
        background: '#e8f5e9', // Vert clair
        color: '#2E7D32', // Vert foncé pour le texte
        fontWeight: 'bold'
      };
    } else {
      return {
        background: '#f5f5f5',
        color: '#333',
        fontWeight: 'normal'
      };
    }
  };

  // Fonction de déconnexion avec SweetAlert2
  const handleLogout = async () => {
    const result = await Swal.fire({
      title: 'Déconnexion',
      text: 'Êtes-vous sûr de vouloir vous déconnecter ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#2E7D32',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Oui, se déconnecter',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      localStorage.clear();
      navigate('/bouctou_poulet/login');
      
      // Afficher un message de confirmation
      Swal.fire({
        title: 'Déconnecté!',
        text: 'Vous avez été déconnecté avec succès.',
        icon: 'success',
        confirmButtonColor: '#2E7D32',
        confirmButtonText: 'OK'
      });
    }
  };

  // Gestion des formulaires
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Vérifier la taille du fichier (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ 
          type: 'error', 
          text: 'L\'image est trop volumineuse. Taille max: 5MB' 
        });
        e.target.value = '';
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        image: file
      }));
    }
  };

  // Ouvrir modal modification
  const handleEditClick = (produit) => {
    console.log('Produit à modifier:', produit);
    setSelectedProduit(produit);
    setFormData({
      nom: produit.nom || '',
      type: produit.type ? produit.type.toLowerCase() : '',
      prix: produit.prix?.toString() || '',
      stock: produit.stock?.toString() || '',
      description: produit.description || '',
      image: null
    });
    setShowModifModal(true);
    setMessage({ type: '', text: '' });
  };

  // Ouvrir modal ajout
  const handleAddClick = () => {
    setFormData({
      nom: '',
      type: '',
      prix: '',
      stock: '',
      description: '',
      image: null
    });
    setShowAjoutModal(true);
    setMessage({ type: '', text: '' });
  };

  // Fermer modales
  const closeModals = () => {
    setShowAjoutModal(false);
    setShowModifModal(false);
    setSelectedProduit(null);
    setFormData({
      nom: '',
      type: '',
      prix: '',
      stock: '',
      description: '',
      image: null
    });
    setMessage({ type: '', text: '' });
  };

  // Fonction pour vérifier et rafraîchir le token si nécessaire
  const verifyToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.clear();
      navigate('/bouctou_poulet/login');
      return false;
    }
    return true;
  };

  // Soumettre ajout
  const handleAjoutSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setMessage({ type: '', text: '' });

    try {
      // Vérifier le token
      if (!await verifyToken()) return;

      const token = localStorage.getItem('token');
      
      // Validation des données
      if (!formData.nom || !formData.type || !formData.prix || !formData.stock) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      // Créer FormData
      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('type', formData.type.toUpperCase());
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('description', formData.description?.trim() || '');
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_URL}/bouctou_poulet/admin/ajouter-produit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
        const text = await response.text();
        data = { message: text || 'Erreur serveur' };
      }

      if (response.ok) {
        // Fermer immédiatement le modal
        closeModals();
        
        // Afficher SweetAlert2 de succès
        Swal.fire({
          title: 'Succès!',
          text: data.message || 'Produit ajouté avec succès!',
          icon: 'success',
          confirmButtonColor: '#2E7D32',
          confirmButtonText: 'OK'
        });
        
        // Rafraîchir les produits
        fetchProduits();
      } else {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/bouctou_poulet/login');
          return;
        }
        
        let errorMessage = data.message || data.error || `Erreur ${response.status}: ${response.statusText}`;
        
        if (response.status === 500) {
          errorMessage = data.message || 'Erreur interne du serveur. Vérifiez les données et réessayez.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de l\'ajout:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de l\'ajout du produit. Veuillez réessayer.' 
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Soumettre modification
  const handleModifSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setMessage({ type: '', text: '' });

    try {
      if (!await verifyToken()) return;

      const token = localStorage.getItem('token');
      
      if (!formData.nom || !formData.type || !formData.prix || !formData.stock) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
      }

      const produitId = selectedProduit.id || selectedProduit._id;
      if (!produitId) {
        throw new Error('ID du produit non trouvé');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('nom', formData.nom.trim());
      formDataToSend.append('type', formData.type.toUpperCase());
      formDataToSend.append('prix', formData.prix);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('description', formData.description?.trim() || '');
      
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }

      const response = await fetch(`${API_URL}/bouctou_poulet/admin/modifier-produit/${produitId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formDataToSend
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        console.error('Erreur parsing JSON:', e);
        const text = await response.text();
        data = { message: text || 'Erreur serveur' };
      }

      if (response.ok) {
        // Fermer immédiatement le modal
        closeModals();
        
        // Afficher SweetAlert2 de succès
        Swal.fire({
          title: 'Succès!',
          text: data.message || 'Produit modifié avec succès!',
          icon: 'success',
          confirmButtonColor: '#2E7D32',
          confirmButtonText: 'OK'
        });
        
        // Rafraîchir les produits
        fetchProduits();
      } else {
        if (response.status === 401) {
          localStorage.clear();
          navigate('/bouctou_poulet/login');
          return;
        }
        
        let errorMessage = data.message || data.error || `Erreur ${response.status}: ${response.statusText}`;
        
        if (response.status === 500) {
          errorMessage = data.message || 'Erreur interne du serveur. Vérifiez les données et réessayez.';
        }
        
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error('Erreur lors de la modification:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de la modification du produit. Veuillez réessayer.' 
      });
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Supprimer un produit avec SweetAlert2
  const handleDeleteClick = async (produit) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous allez supprimer le produit "${produit.nom}". Cette action est irréversible!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d32f2f',
      cancelButtonColor: '#757575',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/bouctou_poulet/login');
          return;
        }

        const produitId = produit.id || produit._id;
        const response = await fetch(`${API_URL}/bouctou_poulet/admin/supprimer-produit/${produitId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          // Afficher SweetAlert2 de succès
          Swal.fire({
            title: 'Supprimé!',
            text: 'Le produit a été supprimé avec succès.',
            icon: 'success',
            confirmButtonColor: '#2E7D32',
            confirmButtonText: 'OK'
          });
          
          // Rafraîchir les produits
          fetchProduits();
        } else {
          const data = await response.json();
          throw new Error(data.message || 'Erreur lors de la suppression');
        }
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        Swal.fire({
          title: 'Erreur!',
          text: `Erreur: ${error.message}`,
          icon: 'error',
          confirmButtonColor: '#d32f2f',
          confirmButtonText: 'OK'
        });
      }
    }
  };

  const menuItems = [
    { label: 'Accueil', icon: LayoutDashboard },
    { label: 'Produits', icon: Package }
  ];

  return (
    <div style={styles.page}>
      {/* ===== APP BAR ===== */}
      <header style={styles.appBar}>
        <div style={styles.appLeft}>
          <img src={logo} alt="logo" style={styles.logo} />
          <h2>Bouctou Poulet</h2>
        </div>

        <div style={styles.userBadge}>
          {user?.prenom} {user?.nom}
        </div>
      </header>

      {/* ===== BODY ===== */}
      <div style={styles.container}>
        {/* SIDEBAR */}
        <aside style={styles.sidebar}>
          <div style={styles.menuTop}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeMenu === item.label;

              return (
                <button
                  key={item.label}
                  style={{
                    ...styles.menuBtn,
                    background: isActive ? '#2E7D32' : 'transparent',
                    color: isActive ? '#fff' : '#2E7D32'
                  }}
                  onClick={() => setActiveMenu(item.label)}
                >
                  <Icon size={20} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* LOGOUT EN BAS */}
          <button
            style={{ ...styles.menuBtn, marginTop: 'auto', color: '#C62828' }}
            onClick={handleLogout}
          >
            <LogOut size={20} />
            <span>Déconnexion</span>
          </button>
        </aside>

        {/* MAIN */}
        <main style={styles.main}>
          <h1 style={styles.mainTitle}>{activeMenu}</h1>

          {activeMenu === 'Accueil' && (
            <div style={styles.cards}>
              <StatCard title="Utilisateurs" value="128" icon={<Users size={28} />} />
              <StatCard title="Produits" value={produits.length.toString()} icon={<Package size={28} />} />
              <StatCard title="Commandes" value="312" icon={<LayoutDashboard size={28} />} />
            </div>
          )}

          {activeMenu === 'Produits' && (
            <div style={styles.contentBox}>
              <div style={styles.produitsHeader}>
                <h2>Liste des produits</h2>
                <button style={styles.addButton} onClick={handleAddClick}>
                  + Ajouter un produit
                </button>
              </div>
              
              {loading ? (
                <div style={styles.loading}>
                  <div style={styles.spinner}></div>
                  <p>Chargement des produits...</p>
                </div>
              ) : error ? (
                <div style={styles.error}>
                  <p style={{ color: '#d32f2f' }}>{error}</p>
                  <button 
                    style={styles.retryButton}
                    onClick={() => fetchProduits()}
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <>
                  <div style={styles.tableContainer}>
                    {produits.length === 0 ? (
                      <div style={styles.emptyState}>
                        <Package size={48} color="#bdbdbd" />
                        <p>Aucun produit disponible</p>
                        <button style={styles.addButton} onClick={handleAddClick}>
                          + Ajouter votre premier produit
                        </button>
                      </div>
                    ) : (
                      <>
                        <table style={styles.table}>
                          <thead style={styles.tableHead}>
                            <tr>
                              <th style={styles.th}>Nom</th>
                              <th style={styles.th}>Type</th>
                              <th style={styles.th}>Prix</th>
                              <th style={styles.th}>Stock</th>
                              <th style={styles.th}>Description</th>
                              <th style={styles.th}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentProducts.map((produit) => {
                              const typeStyle = getTypeColor(produit.type);
                              return (
                                <tr key={produit.id || produit._id} style={styles.tableRow}>
                                  <td style={styles.td}>{produit.nom || 'N/A'}</td>
                                  <td style={{...styles.td, ...typeStyle}}>
                                    {produit.type || 'N/A'}
                                  </td>
                                  <td style={styles.td}>
                                    {produit.prix ? `${produit.prix} FCFA` : 'N/A'}
                                  </td>
                                  <td style={styles.td}>
                                    <span style={{
                                      ...styles.stockBadge,
                                      background: (produit.stock || 0) > 10 ? '#e8f5e9' : '#ffebee',
                                      color: (produit.stock || 0) > 10 ? '#2e7d32' : '#c62828'
                                    }}>
                                      {produit.stock || 0}
                                    </span>
                                  </td>
                                  <td style={styles.td}>
                                    {produit.description 
                                      ? (produit.description.length > 50 
                                        ? `${produit.description.substring(0, 50)}...` 
                                        : produit.description)
                                      : 'Aucune description'}
                                  </td>
                                  <td style={styles.td}>
                                    <div style={styles.actionButtons}>
                                      <button 
                                        style={styles.editButton}
                                        onClick={() => handleEditClick(produit)}
                                      >
                                        Modifier
                                      </button>
                                      <button 
                                        style={styles.deleteButton}
                                        onClick={() => handleDeleteClick(produit)}
                                      >
                                        Supprimer
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {produits.length > productsPerPage && (
                          <div style={styles.pagination}>
                            <div style={styles.paginationInfo}>
                              Affichage de {indexOfFirstProduct + 1} à {Math.min(indexOfLastProduct, produits.length)} sur {produits.length} produits
                            </div>
                            <div style={styles.paginationControls}>
                              <button
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                style={{
                                  ...styles.paginationButton,
                                  opacity: currentPage === 1 ? 0.5 : 1,
                                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <ChevronLeft size={20} />
                              </button>
                              
                              {[...Array(totalPages)].map((_, index) => (
                                <button
                                  key={index + 1}
                                  onClick={() => paginate(index + 1)}
                                  style={{
                                    ...styles.paginationButton,
                                    background: currentPage === index + 1 ? '#2E7D32' : 'transparent',
                                    color: currentPage === index + 1 ? 'white' : '#333',
                                    fontWeight: currentPage === index + 1 ? 'bold' : 'normal'
                                  }}
                                >
                                  {index + 1}
                                </button>
                              ))}
                              
                              <button
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                style={{
                                  ...styles.paginationButton,
                                  opacity: currentPage === totalPages ? 0.5 : 1,
                                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <ChevronRight size={20} />
                              </button>
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>

      {/* MODALE D'AJOUT */}
      {showAjoutModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Ajouter un nouveau produit</h3>
              <button style={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleAjoutSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom du produit *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  placeholder="Ex: Poulet Fermier"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="oeuf">Œuf</option>
                  <option value="poussin">Poussin</option>
                  <option value="poulet">Poulet</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Prix (FCFA) *</label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  min="0"
                  step="100"
                  placeholder="Ex: 5000"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  min="0"
                  placeholder="Ex: 100"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{...styles.input, ...styles.textarea}}
                  rows="3"
                  placeholder="Description du produit..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Image du produit (optionnel)</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  style={styles.input}
                  accept="image/*"
                />
                <small style={styles.helpText}>
                  Formats acceptés: JPG, PNG, JPEG (max 5MB)
                </small>
              </div>

              {message.text && (
                <div style={{
                  ...styles.message,
                  background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: message.type === 'success' ? '#2e7d32' : '#d32f2f'
                }}>
                  {message.type === 'error' && <AlertCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
                  {message.text}
                </div>
              )}

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={closeModals}
                  disabled={loadingSubmit}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 size={18} style={styles.spinnerIcon} />
                      En cours...
                    </>
                  ) : (
                    'Ajouter le produit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE MODIFICATION */}
      {showModifModal && selectedProduit && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Modifier le produit: {selectedProduit.nom}</h3>
              <button style={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleModifSubmit}>
              <div style={styles.formGroup}>
                <label style={styles.label}>Nom du produit *</label>
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Type *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                >
                  <option value="">Sélectionner un type</option>
                  <option value="oeuf">Œuf</option>
                  <option value="poussin">Poussin</option>
                  <option value="poulet">Poulet</option>
                </select>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Prix (FCFA) *</label>
                <input
                  type="number"
                  name="prix"
                  value={formData.prix}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  min="0"
                  step="100"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Stock *</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleInputChange}
                  style={styles.input}
                  required
                  min="0"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  style={{...styles.input, ...styles.textarea}}
                  rows="3"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Nouvelle image (optionnel)</label>
                <input
                  type="file"
                  name="image"
                  onChange={handleFileChange}
                  style={styles.input}
                  accept="image/*"
                />
                <small style={styles.helpText}>
                  Laissez vide pour conserver l'image actuelle
                </small>
              </div>

              {message.text && (
                <div style={{
                  ...styles.message,
                  background: message.type === 'success' ? '#e8f5e9' : '#ffebee',
                  color: message.type === 'success' ? '#2e7d32' : '#d32f2f'
                }}>
                  {message.type === 'error' && <AlertCircle size={16} style={{ marginRight: '8px', verticalAlign: 'middle' }} />}
                  {message.text}
                </div>
              )}

              <div style={styles.modalFooter}>
                <button
                  type="button"
                  style={styles.cancelButton}
                  onClick={closeModals}
                  disabled={loadingSubmit}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  style={styles.submitButton}
                  disabled={loadingSubmit}
                >
                  {loadingSubmit ? (
                    <>
                      <Loader2 size={18} style={styles.spinnerIcon} />
                      En cours...
                    </>
                  ) : (
                    'Modifier le produit'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

/* ===== CARD ===== */
function StatCard({ title, value, icon }) {
  return (
    <div style={styles.card}>
      <div style={styles.cardIcon}>{icon}</div>
      <div>
        <h3 style={styles.cardValue}>{value}</h3>
        <p style={styles.cardTitle}>{title}</p>
      </div>
    </div>
  );
}

/* =======================
   STYLES
======================= */
const styles = {
  page: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Inter, sans-serif',
    backgroundColor: '#f4fbf6'
  },

  appBar: {
    height: '65px',
    background: 'linear-gradient(135deg, #2E7D32, #66BB6A)',
    color: '#fff',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0 30px',
    boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100
  },

  appLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },

  logo: {
    width: '38px',
    background: '#fff',
    borderRadius: '8px',
    padding: '4px'
  },

  userBadge: {
    background: 'rgba(255,255,255,0.2)',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 600
  },

  container: {
    flex: 1,
    display: 'flex',
    minHeight: 0
  },

  sidebar: {
    width: '260px',
    background: '#fff',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '4px 0 15px rgba(0,0,0,0.05)',
    flexShrink: 0
  },

  menuTop: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },

  menuBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 18px',
    borderRadius: '12px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '15px',
    fontWeight: 600,
    background: 'transparent',
    transition: 'all 0.3s ease',
    boxSizing: 'border-box'
  },

  main: {
    flex: 1,
    padding: '30px',
    overflowY: 'auto'
  },

  mainTitle: {
    color: '#2E7D32',
    marginBottom: '30px',
    fontSize: '28px'
  },

  contentBox: {
    background: '#fff',
    borderRadius: '16px',
    padding: '30px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
  },

  produitsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px'
  },

  addButton: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '14px',
    transition: 'background 0.3s',
    ':hover': {
      background: '#1B5E20'
    }
  },

  loading: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0'
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e8f5e9',
    borderTop: '4px solid #2E7D32',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    marginBottom: '20px'
  },

  error: {
    textAlign: 'center',
    padding: '40px 0'
  },

  retryButton: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '15px',
    fontSize: '14px'
  },

  tableContainer: {
    overflowX: 'auto'
  },

  emptyState: {
    textAlign: 'center',
    padding: '60px 0',
    color: '#757575',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },

  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0'
  },

  tableHead: {
    background: '#f1f8e9'
  },

  th: {
    padding: '16px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: '#2E7D32',
    borderBottom: '2px solid #c8e6c9'
  },

  tableRow: {
    borderBottom: '1px solid #e0e0e0',
    transition: 'background 0.2s',
    ':hover': {
      background: '#f9f9f9'
    }
  },

  td: {
    padding: '16px 12px',
    verticalAlign: 'middle'
  },

  stockBadge: {
    padding: '4px 12px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: 600,
    display: 'inline-block'
  },

  actionButtons: {
    display: 'flex',
    gap: '8px'
  },

  editButton: {
    background: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.3s',
    ':hover': {
      background: '#1565c0'
    }
  },

  deleteButton: {
    background: '#d32f2f',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.3s',
    ':hover': {
      background: '#c2185b'
    }
  },

  // Pagination styles
  pagination: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '20px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0'
  },

  paginationInfo: {
    fontSize: '14px',
    color: '#666'
  },

  paginationControls: {
    display: 'flex',
    gap: '5px',
    alignItems: 'center'
  },

  paginationButton: {
    padding: '8px 12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    background: 'transparent',
    cursor: 'pointer',
    fontSize: '14px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: '40px',
    ':hover': {
      background: '#f5f5f5'
    }
  },

  cards: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '25px'
  },

  card: {
    background: '#fff',
    borderRadius: '20px',
    padding: '25px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.08)',
    transition: 'transform 0.3s',
    ':hover': {
      transform: 'translateY(-5px)'
    }
  },

  cardIcon: {
    background: '#E8F5E9',
    padding: '15px',
    borderRadius: '14px',
    color: '#2E7D32'
  },

  cardValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#2E7D32',
    margin: '0 0 5px 0'
  },

  cardTitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0'
  },

  // Styles pour les modales
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    padding: '20px'
  },

  modal: {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '500px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
  },

  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '20px 24px',
    borderBottom: '1px solid #e0e0e0'
  },

  modalTitle: {
    margin: 0,
    color: '#2E7D32',
    fontSize: '20px'
  },

  closeButton: {
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    color: '#666',
    padding: '5px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      background: '#f5f5f5'
    }
  },

  formGroup: {
    marginBottom: '20px',
    padding: '0 24px'
  },

  label: {
    display: 'block',
    marginBottom: '8px',
    fontWeight: '600',
    color: '#333',
    fontSize: '14px'
  },

  input: {
    width: '100%',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '6px',
    fontSize: '14px',
    boxSizing: 'border-box',
    transition: 'border 0.3s',
    ':focus': {
      outline: 'none',
      borderColor: '#2E7D32',
      boxShadow: '0 0 0 2px rgba(46, 125, 50, 0.1)'
    }
  },

  textarea: {
    resize: 'vertical',
    minHeight: '80px',
    fontFamily: 'inherit'
  },

  helpText: {
    display: 'block',
    marginTop: '5px',
    color: '#666',
    fontSize: '12px'
  },

  message: {
    margin: '20px 24px',
    padding: '12px 16px',
    borderRadius: '6px',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center'
  },

  modalFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '20px 24px',
    borderTop: '1px solid #e0e0e0',
    background: '#f9f9f9',
    borderBottomLeftRadius: '12px',
    borderBottomRightRadius: '12px'
  },

  cancelButton: {
    background: 'transparent',
    color: '#666',
    border: '1px solid #ddd',
    padding: '10px 20px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'all 0.3s',
    ':hover': {
      background: '#f5f5f5'
    }
  },

  submitButton: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '10px 24px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: '600',
    fontSize: '14px',
    transition: 'background 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    ':hover': {
      background: '#1B5E20'
    },
    ':disabled': {
      background: '#a5d6a7',
      cursor: 'not-allowed'
    }
  },

  spinnerIcon: {
    animation: 'spin 1s linear infinite'
  }
};

// Ajouter la keyframe pour l'animation du spinner
const styleSheet = document.styleSheets[0];
if (styleSheet) {
  styleSheet.insertRule(`
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `, styleSheet.cssRules.length);
}