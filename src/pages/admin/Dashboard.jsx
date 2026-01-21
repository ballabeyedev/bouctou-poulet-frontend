// src/pages/dashboard/Dashboard.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  LogOut,
  X,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  User,
  Package as PackageIcon
} from 'lucide-react';
import logo from '../../assets/images/logo.jpg';
import Swal from 'sweetalert2';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [activeMenu, setActiveMenu] = useState('Accueil');
  const API_URL = 'https://bouctou-poulet-back.onrender.com';
  const [produits, setProduits] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCommandes, setLoadingCommandes] = useState(false);
  const [error, setError] = useState(null);
  const [errorCommandes, setErrorCommandes] = useState(null);
  
  // États pour la pagination produits
  const [currentPage, setCurrentPage] = useState(1);
  const [productsPerPage] = useState(5);
  
  // États pour la pagination commandes
  const [currentPageCommandes, setCurrentPageCommandes] = useState(1);
  const [commandesPerPage] = useState(5);
  
  // États pour les modales produits
  const [showAjoutModal, setShowAjoutModal] = useState(false);
  const [showModifModal, setShowModifModal] = useState(false);
  const [selectedProduit, setSelectedProduit] = useState(null);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // États pour les modales commandes
  const [showUserModal, setShowUserModal] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedCommande, setSelectedCommande] = useState(null);
  const [selectedUserInfo, setSelectedUserInfo] = useState(null);
  const [selectedProductInfo, setSelectedProductInfo] = useState(null);
  
  // États pour le formulaire produit
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

  // Récupération des commandes
  const fetchCommandes = async () => {
    try {
      setLoadingCommandes(true);
      setErrorCommandes(null);
      const token = localStorage.getItem('token');
      
      if (!token) {
        navigate('/bouctou_poulet/login');
        return;
      }

      const response = await fetch('https://bouctou-poulet-back.onrender.com/bouctou_poulet/client/liste-commendes-client', {
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
      
      if (data.success && Array.isArray(data.data)) {
        setCommandes(data.data);
      } else {
        setCommandes([]);
        console.warn('Format de données commandes non reconnu:', data);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des commandes:', error);
      setErrorCommandes('Impossible de charger les commandes. Veuillez réessayer.');
      setCommandes([]);
    } finally {
      setLoadingCommandes(false);
    }
  };

  useEffect(() => {
    if (activeMenu === 'Produits') {
      fetchProduits();
    } else if (activeMenu === 'Commandes') {
      fetchCommandes();
    }
  }, [activeMenu]);

  // Calcul des produits pour la pagination
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = produits.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(produits.length / productsPerPage);

  // Calcul des commandes pour la pagination
  const indexOfLastCommande = currentPageCommandes * commandesPerPage;
  const indexOfFirstCommande = indexOfLastCommande - commandesPerPage;
  const currentCommandes = commandes.slice(indexOfFirstCommande, indexOfLastCommande);
  const totalPagesCommandes = Math.ceil(commandes.length / commandesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const paginateCommandes = (pageNumber) => setCurrentPageCommandes(pageNumber);
  
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

  const nextPageCommandes = () => {
    if (currentPageCommandes < totalPagesCommandes) {
      setCurrentPageCommandes(currentPageCommandes + 1);
    }
  };
  
  const prevPageCommandes = () => {
    if (currentPageCommandes > 1) {
      setCurrentPageCommandes(currentPageCommandes - 1);
    }
  };

  // Fonction pour obtenir la couleur en fonction du type
  const getTypeColor = (type) => {
    const typeLower = type?.toLowerCase();
    
    if (typeLower === 'oeuf') {
      return {
        background: '#fffaf0',
        color: '#8B4513',
        fontWeight: 'bold'
      };
    } else if (typeLower === 'poussin') {
      return {
        background: '#fffacd',
        color: '#DAA520',
        fontWeight: 'bold'
      };
    } else if (typeLower === 'poulet') {
      return {
        background: '#e8f5e9',
        color: '#2E7D32',
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

  // Fonction pour obtenir la couleur en fonction du statut
  const getStatusColor = (statut) => {
    const statutLower = statut?.toLowerCase();
    
    if (statutLower === 'livré' || statutLower === 'livre') {
      return {
        background: '#e8f5e9',
        color: '#2E7D32',
        fontWeight: 'bold'
      };
    } else if (statutLower === 'en_attente' || statutLower === 'en attente') {
      return {
        background: '#fff3e0',
        color: '#ef6c00',
        fontWeight: 'bold'
      };
    } else if (statutLower === 'annulé' || statutLower === 'annule') {
      return {
        background: '#ffebee',
        color: '#c62828',
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

  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      
      Swal.fire({
        title: 'Déconnecté!',
        text: 'Vous avez été déconnecté avec succès.',
        icon: 'success',
        confirmButtonColor: '#2E7D32',
        confirmButtonText: 'OK'
      });
    }
  };

  // Gestion des formulaires produits
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

  // Ouvrir modal modification produit
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

  // Ouvrir modal ajout produit
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

  // Ouvrir modal utilisateur
  const handleUserClick = (commande) => {
    setSelectedCommande(commande);
    setSelectedUserInfo({
      nomComplet: commande.nomComplet,
      telephone: commande.telephone,
      adresse: commande.adresse
    });
    setShowUserModal(true);
  };

  // Ouvrir modal produit
  const handleProductClick = (commande) => {
    setSelectedCommande(commande);
    setSelectedProductInfo(commande.produit);
    setShowProductModal(true);
  };

  // Fermer modales
  const closeModals = () => {
    setShowAjoutModal(false);
    setShowModifModal(false);
    setShowUserModal(false);
    setShowProductModal(false);
    setSelectedProduit(null);
    setSelectedCommande(null);
    setSelectedUserInfo(null);
    setSelectedProductInfo(null);
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

  // Soumettre ajout produit
  const handleAjoutSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);
    setMessage({ type: '', text: '' });

    try {
      if (!await verifyToken()) return;

      const token = localStorage.getItem('token');
      
      if (!formData.nom || !formData.type || !formData.prix || !formData.stock) {
        throw new Error('Veuillez remplir tous les champs obligatoires');
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
        closeModals();
        
        Swal.fire({
          title: 'Succès!',
          text: data.message || 'Produit ajouté avec succès!',
          icon: 'success',
          confirmButtonColor: '#2E7D32',
          confirmButtonText: 'OK'
        });
        
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

  // Soumettre modification produit
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
        closeModals();
        
        Swal.fire({
          title: 'Succès!',
          text: data.message || 'Produit modifié avec succès!',
          icon: 'success',
          confirmButtonColor: '#2E7D32',
          confirmButtonText: 'OK'
        });
        
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
          Swal.fire({
            title: 'Supprimé!',
            text: 'Le produit a été supprimé avec succès.',
            icon: 'success',
            confirmButtonColor: '#2E7D32',
            confirmButtonText: 'OK'
          });
          
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
    { label: 'Produits', icon: Package },
    { label: 'Commandes', icon: ShoppingCart }
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
              <StatCard title="Commandes" value={commandes.length.toString()} icon={<ShoppingCart size={28} />} />
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

          {activeMenu === 'Commandes' && (
            <div style={styles.contentBox}>
              <div style={styles.produitsHeader}>
                <h2>Liste des commandes</h2>
              </div>
              
              {loadingCommandes ? (
                <div style={styles.loading}>
                  <div style={styles.spinner}></div>
                  <p>Chargement des commandes...</p>
                </div>
              ) : errorCommandes ? (
                <div style={styles.error}>
                  <p style={{ color: '#d32f2f' }}>{errorCommandes}</p>
                  <button 
                    style={styles.retryButton}
                    onClick={() => fetchCommandes()}
                  >
                    Réessayer
                  </button>
                </div>
              ) : (
                <>
                  <div style={styles.tableContainer}>
                    {commandes.length === 0 ? (
                      <div style={styles.emptyState}>
                        <ShoppingCart size={48} color="#bdbdbd" />
                        <p>Aucune commande disponible</p>
                      </div>
                    ) : (
                      <>
                        <table style={styles.table}>
                          <thead style={styles.tableHead}>
                            <tr>
                              <th style={styles.th}>Client</th>
                              <th style={styles.th}>Quantité</th>
                              <th style={styles.th}>Total</th>
                              <th style={styles.th}>Statut</th>
                              <th style={styles.th}>Date Commande</th>
                              <th style={styles.th}>Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {currentCommandes.map((commande) => {
                              const statusStyle = getStatusColor(commande.statut);
                              return (
                                <tr key={commande.id} style={styles.tableRow}>
                                  <td style={styles.td}>{commande.nomComplet || 'N/A'}</td>
                                  <td style={styles.td}>{commande.quantite || 'N/A'}</td>
                                  <td style={styles.td}>
                                    {commande.total ? `${parseFloat(commande.total).toLocaleString('fr-FR')} FCFA` : 'N/A'}
                                  </td>
                                  <td style={styles.td}>
                                    <span style={{
                                      ...styles.stockBadge,
                                      ...statusStyle
                                    }}>
                                      {commande.statut ? commande.statut.replace('_', ' ') : 'N/A'}
                                    </span>
                                  </td>
                                  <td style={styles.td}>{formatDate(commande.dateCommande)}</td>
                                  <td style={styles.td}>
                                    <div style={styles.actionButtons}>
                                      <button 
                                        style={styles.userButton}
                                        onClick={() => handleUserClick(commande)}
                                      >
                                        <User size={14} /> Client
                                      </button>
                                      <button 
                                        style={styles.productButton}
                                        onClick={() => handleProductClick(commande)}
                                      >
                                        <PackageIcon size={14} /> Produit
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                        
                        {/* Pagination */}
                        {commandes.length > commandesPerPage && (
                          <div style={styles.pagination}>
                            <div style={styles.paginationInfo}>
                              Affichage de {indexOfFirstCommande + 1} à {Math.min(indexOfLastCommande, commandes.length)} sur {commandes.length} commandes
                            </div>
                            <div style={styles.paginationControls}>
                              <button
                                onClick={prevPageCommandes}
                                disabled={currentPageCommandes === 1}
                                style={{
                                  ...styles.paginationButton,
                                  opacity: currentPageCommandes === 1 ? 0.5 : 1,
                                  cursor: currentPageCommandes === 1 ? 'not-allowed' : 'pointer'
                                }}
                              >
                                <ChevronLeft size={20} />
                              </button>
                              
                              {[...Array(totalPagesCommandes)].map((_, index) => (
                                <button
                                  key={index + 1}
                                  onClick={() => paginateCommandes(index + 1)}
                                  style={{
                                    ...styles.paginationButton,
                                    background: currentPageCommandes === index + 1 ? '#2E7D32' : 'transparent',
                                    color: currentPageCommandes === index + 1 ? 'white' : '#333',
                                    fontWeight: currentPageCommandes === index + 1 ? 'bold' : 'normal'
                                  }}
                                >
                                  {index + 1}
                                </button>
                              ))}
                              
                              <button
                                onClick={nextPageCommandes}
                                disabled={currentPageCommandes === totalPagesCommandes}
                                style={{
                                  ...styles.paginationButton,
                                  opacity: currentPageCommandes === totalPagesCommandes ? 0.5 : 1,
                                  cursor: currentPageCommandes === totalPagesCommandes ? 'not-allowed' : 'pointer'
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

      {/* MODALE D'AJOUT PRODUIT */}
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

      {/* MODALE DE MODIFICATION PRODUIT */}
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

      {/* MODALE UTILISATEUR */}
      {showUserModal && selectedUserInfo && (
        <div style={styles.modalOverlay}>
          <div style={styles.smallModal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Informations du client</h3>
              <button style={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.infoContainer}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Nom complet:</span>
                <span style={styles.infoValue}>{selectedUserInfo.nomComplet || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Téléphone:</span>
                <span style={styles.infoValue}>{selectedUserInfo.telephone || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Adresse:</span>
                <span style={styles.infoValue}>{selectedUserInfo.adresse || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={closeModals}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE PRODUIT */}
      {showProductModal && selectedProductInfo && (
        <div style={styles.modalOverlay}>
          <div style={styles.smallModal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Informations du produit</h3>
              <button style={styles.closeButton} onClick={closeModals}>
                <X size={20} />
              </button>
            </div>
            
            <div style={styles.infoContainer}>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Nom:</span>
                <span style={styles.infoValue}>{selectedProductInfo.nom || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Prix:</span>
                <span style={styles.infoValue}>{selectedProductInfo.prix ? `${selectedProductInfo.prix} FCFA` : 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Type:</span>
                <span style={styles.infoValue}>{selectedProductInfo.type || 'N/A'}</span>
              </div>
              <div style={styles.infoRow}>
                <span style={styles.infoLabel}>Description:</span>
                <span style={styles.infoValue}>{selectedProductInfo.description || 'N/A'}</span>
              </div>
            </div>

            <div style={styles.modalFooter}>
              <button
                type="button"
                style={styles.cancelButton}
                onClick={closeModals}
              >
                Fermer
              </button>
            </div>
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

  userButton: {
    background: '#1976d2',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    ':hover': {
      background: '#1565c0'
    }
  },

  productButton: {
    background: '#2E7D32',
    color: 'white',
    border: 'none',
    padding: '6px 12px',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    transition: 'background 0.3s',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    ':hover': {
      background: '#1B5E20'
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

  smallModal: {
    background: 'white',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
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

  infoContainer: {
    padding: '24px'
  },

  infoRow: {
    display: 'flex',
    marginBottom: '16px',
    alignItems: 'flex-start'
  },

  infoLabel: {
    fontWeight: '600',
    color: '#333',
    width: '120px',
    flexShrink: 0
  },

  infoValue: {
    color: '#666',
    flex: 1
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