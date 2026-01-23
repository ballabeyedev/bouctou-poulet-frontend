import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Swal from 'sweetalert2';
import logo from '../assets/images/logo.jpg';
import defaultProductImage from '../assets/images/default.png';
import poussinImage from '../assets/images/poussin.jpg';
import pouletImage from '../assets/images/poulet.jpg';
import oeufImage from '../assets/images/oeuf.jpg';
import Oueuf_rouge from '../assets/images/Oeufs_rouges.jpeg';
import Oueuf_blanc from '../assets/images/Oeufs_blancs.webp';
import Poulet_Goliath from '../assets/images/poulet_goliath.jpeg';
import Poussin_jour from '../assets/images/Poussin_un_jour.jpeg';
import Poussin_moi from '../assets/images/Poussin_un_mois.jpeg';
import Poussin_semaine from '../assets/images/poussin_un_semaine.jpeg';
import viande_poulet from '../assets/images/Viande_poulet.jpeg';
import '../assets/css/Home.css';

export default function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredProduct, setHoveredProduct] = useState(null);
  const [activeSection, setActiveSection] = useState('accueil');
  const [produits, setProduits] = useState([]);
  const [loadingProduits, setLoadingProduits] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // États pour le modal de commande
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);
  const [modalStep, setModalStep] = useState(1);
  const [clientInfo, setClientInfo] = useState({
    nomComplet: '',
    telephone: '',
    adresse: ''
  });
  const [formErrors, setFormErrors] = useState({});

  const heroRef = useRef(null);
  const produitsRef = useRef(null);
  const aboutRef = useRef(null);
  const contactRef = useRef(null);
  const productsContainerRef = useRef(null);

  // Fonction pour détecter la taille d'écran
  const checkScreenSize = () => {
    const width = window.innerWidth;
    setIsMobile(width <= 768);
    setIsTablet(width > 768 && width <= 1024);
  };

  // Fonction pour obtenir l'image du produit selon sa description
  const getProductImage = (description) => {
    if (!description) return defaultProductImage;
    
    const descLower = description.toLowerCase();
    
    // Vérification pour les œufs
    if (descLower.includes('oeuf rouge') || descLower.includes('oeufs rouges')) {
      return Oueuf_rouge;
    }
    
    if (descLower.includes('oeuf blanc') || descLower.includes('oeufs blancs')) {
      return Oueuf_blanc;
    }
    
    // Vérification pour les poulets
    if (descLower.includes('poulet goliath') || descLower.includes('poulets goliaths')) {
      return Poulet_Goliath;
    }
    
    if (descLower.includes('viande poulet')) {
      return viande_poulet;
    }
    
    // Vérification pour les poussins
    if (descLower.includes('poussin un jour') || descLower.includes('poussins un jour')) {
      return Poussin_jour;
    }
    
    if (descLower.includes('poussin un mois') || descLower.includes('poussins un mois')) {
      return Poussin_moi;
    }
    
    if (descLower.includes('poussin un semaine') || descLower.includes('poussins un semaine')) {
      return Poussin_semaine;
    }
    
    // Fallback basé sur le type si la description n'est pas spécifique
    return defaultProductImage;
  };

  // Fonction utilitaire pour obtenir l'image avec fallback au type si nécessaire
  const getProductImageWithFallback = (produit) => {
    if (!produit) return defaultProductImage;
    
    const imageByDesc = getProductImage(produit.description);
    
    // Si on a trouvé une image spécifique par description, on l'utilise
    if (imageByDesc !== defaultProductImage) {
      return imageByDesc;
    }
    
    // Sinon, on essaie de déterminer par le type
    if (!produit.type) return defaultProductImage;
    
    const typeUpper = produit.type.toUpperCase();
    switch(typeUpper) {
      case 'POUSSIN':
        return poussinImage;
      case 'POULET':
        return pouletImage;
      case 'OEUF':
        return oeufImage;
      default:
        return defaultProductImage;
    }
  };

  useEffect(() => {
    const fetchProduits = async () => {
      try {
        const response = await fetch(
          'https://bouctou-poulet-back.onrender.com/bouctou_poulet/client/liste-produit-client'
        );
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (Array.isArray(data)) {
          setProduits(data);
        } else if (data.produits && Array.isArray(data.produits)) {
          setProduits(data.produits);
        } else if (data.data && Array.isArray(data.data)) {
          setProduits(data.data);
        } else {
          setProduits([]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setProduits([]);
      } finally {
        setLoadingProduits(false);
      }
    };

    fetchProduits();
  }, []);

  useEffect(() => {
    setIsVisible(true);
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    
    const handleScroll = () => {
      const sections = [
        { id: 'accueil', ref: heroRef },
        { id: 'produits', ref: produitsRef },
        { id: 'apropos', ref: aboutRef },
        { id: 'contact', ref: contactRef }
      ];

      const scrollPosition = window.scrollY + 100;

      for (const section of sections) {
        if (section.ref.current) {
          const { offsetTop, offsetHeight } = section.ref.current;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            setActiveSection(section.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    let slideInterval;
    if (produits.length > 0) {
      slideInterval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % produits.length);
      }, 4000);
    }
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', checkScreenSize);
      if (slideInterval) clearInterval(slideInterval);
    };
  }, [produits.length]);

  const openOrderModal = (produit) => {
    setSelectedProduct(produit);
    setQuantity(1);
    setModalStep(1);
    setClientInfo({
      nomComplet: '',
      telephone: '',
      adresse: ''
    });
    setFormErrors({});
    
    const prixNumérique = extractPrix(produit.prix);
    setTotalPrice(prixNumérique * 1);
    
    setIsModalOpen(true);
  };

  const closeOrderModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
    setQuantity(1);
    setTotalPrice(0);
    setModalStep(1);
    setClientInfo({
      nomComplet: '',
      telephone: '',
      adresse: ''
    });
    setFormErrors({});
  };

  const extractPrix = (prix) => {
    if (!prix && prix !== 0) return 0;
    
    if (typeof prix === 'number') {
      return prix;
    }
    
    if (typeof prix === 'string') {
      const numericString = prix.replace(/[^\d.,]/g, '');
      const normalizedString = numericString.replace(',', '.');
      const prixNumérique = parseFloat(normalizedString);
      
      return isNaN(prixNumérique) ? 0 : prixNumérique;
    }
    
    const prixNumérique = parseFloat(prix);
    return isNaN(prixNumérique) ? 0 : prixNumérique;
  };

  const formatPrix = (prix) => {
    const prixNumérique = extractPrix(prix);
    return new Intl.NumberFormat('fr-FR').format(prixNumérique);
  };

  const updateQuantity = (newQuantity) => {
    if (newQuantity < 1) newQuantity = 1;
    if (selectedProduct && newQuantity > selectedProduct.stock) {
      newQuantity = selectedProduct.stock;
    }
    
    setQuantity(newQuantity);
    
    if (selectedProduct) {
      const prixNumérique = extractPrix(selectedProduct.prix);
      setTotalPrice(prixNumérique * newQuantity);
    }
  };

  const incrementQuantity = () => {
    updateQuantity(quantity + 1);
  };

  const decrementQuantity = () => {
    updateQuantity(quantity - 1);
  };

  const handleClientInfoChange = (field, value) => {
    setClientInfo(prev => ({
      ...prev,
      [field]: value
    }));
    
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const validateClientForm = () => {
    const errors = {};
    
    if (!clientInfo.nomComplet.trim()) {
      errors.nomComplet = 'Le nom complet est requis';
    }
    
    if (!clientInfo.telephone.trim()) {
      errors.telephone = 'Le numéro de téléphone est requis';
    } else if (!/^(\+223|0)[0-9]{8}$/.test(clientInfo.telephone.replace(/\s/g, ''))) {
      errors.telephone = 'Numéro de téléphone malien invalide';
    }
    
    if (!clientInfo.adresse.trim()) {
      errors.adresse = 'L\'adresse est requise';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const nextStep = () => {
    if (modalStep < 3) {
      setModalStep(modalStep + 1);
    }
  };

  const prevStep = () => {
    if (modalStep > 1) {
      setModalStep(modalStep - 1);
    }
  };

  const handleOrderSubmit = async () => {
    if (!selectedProduct || !validateClientForm()) return;
    
    try {
      const commandeData = {
        idProduit: selectedProduct.id,
        quantite: quantity,
        nomComplet: clientInfo.nomComplet,
        telephone: clientInfo.telephone,
        adresse: clientInfo.adresse
      };
      
      const response = await fetch(
        'https://bouctou-poulet-back.onrender.com/bouctou_poulet/client/commander-produit-client',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(commandeData)
        }
      );
      
      if (response.ok) {
        // Fermer le modal IMMÉDIATEMENT
        closeOrderModal();
        
        // Puis afficher SweetAlert
        await Swal.fire({
          title: 'Commande réussie !',
          text: `Commande de ${quantity} ${selectedProduct.nom} pour un total de ${formatPrix(totalPrice)} CFA a été enregistrée pour ${clientInfo.nomComplet} !`,
          icon: 'success',
          confirmButtonText: 'OK',
          confirmButtonColor: '#2E7D32',
          background: '#ffffff',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button'
          },
          allowOutsideClick: false,
          allowEscapeKey: false
        });
      } else {
        await Swal.fire({
          title: 'Erreur',
          text: 'Une erreur est survenue lors de la commande. Veuillez réessayer.',
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d32f2f',
          background: '#ffffff',
          customClass: {
            popup: 'custom-swal-popup',
            title: 'custom-swal-title',
            confirmButton: 'custom-swal-confirm-button'
          },
          allowOutsideClick: false,
          allowEscapeKey: false
        });
      }
      
    } catch (error) {
      await Swal.fire({
        title: 'Erreur de connexion',
        text: 'Problème de connexion réseau. Vérifiez votre connexion internet.',
        icon: 'error',
        confirmButtonText: 'OK',
        confirmButtonColor: '#d32f2f',
        background: '#ffffff',
        customClass: {
          popup: 'custom-swal-popup',
          title: 'custom-swal-title',
          confirmButton: 'custom-swal-confirm-button'
        },
        allowOutsideClick: false,
        allowEscapeKey: false
      });
    }
  };

  const scrollProducts = (direction) => {
    if (productsContainerRef.current) {
      const container = productsContainerRef.current;
      const scrollAmount = isMobile ? 280 : 320;
      
      if (direction === 'left') {
        container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  const scrollToSection = (sectionId) => {
    const sections = {
      accueil: heroRef,
      produits: produitsRef,
      apropos: aboutRef,
      contact: contactRef
    };

    if (sections[sectionId]?.current) {
      window.scrollTo({
        top: sections[sectionId].current.offsetTop - 80,
        behavior: 'smooth'
      });
    }
  };

  const getProductIcon = (type) => {
    if (!type) return '🐔';
    switch(type.toUpperCase()) {
      case 'POULET': return '🐔';
      case 'OEUF': return '🥚';
      case 'POUSSIN': return '🐣';
      default: return '🐔';
    }
  };

  const getProductTypeLabel = (type) => {
    if (!type) return 'Produit';
    switch(type.toUpperCase()) {
      case 'POULET': return 'Poulet';
      case 'OEUF': return 'Œuf';
      case 'POUSSIN': return 'Poussin';
      default: return type;
    }
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const getResponsivePadding = () => {
    if (isMobile) return '0 15px';
    if (isTablet) return '0 30px';
    return '0 40px';
  };

  const getResponsiveHeroPadding = () => {
    if (isMobile) return '80px 15px 40px';
    if (isTablet) return '100px 30px 50px';
    return '120px 40px 60px';
  };

  const getResponsiveSectionPadding = () => {
    if (isMobile) return '40px 15px';
    if (isTablet) return '60px 30px';
    return '80px 40px';
  };

  const renderStep1 = () => (
    <div style={styles.modalContent}>
      <div style={styles.productPreview}>
        <div style={styles.productImageModal}>
          <img
            src={getProductImageWithFallback(selectedProduct)}
            alt={selectedProduct.nom}
            style={styles.modalImage}
            onError={(e) => {
              e.target.src = defaultProductImage;
            }}
          />
          <div style={styles.productCategoryModal}>
            <span style={styles.categoryIcon}>
              {getProductIcon(selectedProduct.type)}
            </span>
            <span>{getProductTypeLabel(selectedProduct.type)}</span>
          </div>
        </div>
        
        <div style={styles.productDetails}>
          <h4 style={styles.productNameModal}>{selectedProduct.nom}</h4>
          <p style={styles.productDescriptionModal}>
            {selectedProduct.description || 'Produit de qualité supérieure'}
          </p>
          
          <div style={styles.productInfoGrid}>
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Prix unitaire :</span>
              <span style={styles.infoValue}>{selectedProduct.prix} CFA</span>
            </div>
            
            <div style={styles.infoItem}>
              <span style={styles.infoLabel}>Disponibilité :</span>
              <span style={{
                ...styles.infoValue,
                color: (selectedProduct.stock || 0) > 0 ? '#2E7D32' : '#d32f2f'
              }}>
                {(selectedProduct.stock || 0) > 0 ? `${selectedProduct.stock} unités` : 'Rupture de stock'}
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div style={styles.stepNavigation}>
        <button 
          onClick={nextStep}
          style={styles.nextButton}
          disabled={(selectedProduct.stock || 0) <= 0}
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div style={styles.modalContent}>
      <div style={styles.stepHeader}>
        <h4 style={styles.stepTitle}>Choisir la quantité</h4>
      </div>
      
      <div style={styles.quantitySection}>
        <div style={styles.quantitySelector}>
          <button 
            onClick={decrementQuantity}
            style={styles.quantityButton}
            disabled={quantity <= 1}
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max={selectedProduct.stock}
            value={quantity}
            onChange={(e) => updateQuantity(parseInt(e.target.value) || 1)}
            style={styles.quantityInput}
          />
          <button 
            onClick={incrementQuantity}
            style={styles.quantityButton}
            disabled={quantity >= (selectedProduct.stock || 0)}
          >
            +
          </button>
        </div>
        
        <div style={styles.calculationSection}>
          <div style={styles.calculationRow}>
            <span style={styles.calcLabel}>Prix unitaire :</span>
            <span style={styles.calcValue}>{selectedProduct.prix} CFA</span>
          </div>
          
          <div style={styles.calculationRow}>
            <span style={styles.calcLabel}>Quantité :</span>
            <span style={styles.calcValue}>{quantity}</span>
          </div>
          
          <div style={styles.calculationRow}>
            <span style={styles.calcLabel}>Total :</span>
            <span style={styles.totalPrice}>{formatPrix(totalPrice)} CFA</span>
          </div>
          
          <div style={styles.calculationFormula}>
            {quantity} × {selectedProduct.prix} = {formatPrix(totalPrice)} CFA
          </div>
        </div>
      </div>
      
      <div style={styles.stepNavigation}>
        <button 
          onClick={prevStep}
          style={styles.backButton}
        >
          Retour
        </button>
        <button 
          onClick={nextStep}
          style={styles.nextButton}
        >
          Suivant
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div style={styles.modalContent}>
      <div style={styles.stepHeader}>
        <h4 style={styles.stepTitle}>Informations client</h4>
      </div>
      
      <div style={styles.clientForm}>
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="nomComplet">
            Nom complet *
          </label>
          <input
            type="text"
            id="nomComplet"
            value={clientInfo.nomComplet}
            onChange={(e) => handleClientInfoChange('nomComplet', e.target.value)}
            placeholder="Votre nom et prénom"
            style={{
              ...styles.formInput,
              borderColor: formErrors.nomComplet ? '#d32f2f' : '#ddd'
            }}
          />
          {formErrors.nomComplet && (
            <span style={styles.errorText}>{formErrors.nomComplet}</span>
          )}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="telephone">
            Numéro de téléphone *
          </label>
          <input
            type="tel"
            id="telephone"
            value={clientInfo.telephone}
            onChange={(e) => handleClientInfoChange('telephone', e.target.value)}
            placeholder="Ex: +223 91 17 86 64"
            style={{
              ...styles.formInput,
              borderColor: formErrors.telephone ? '#d32f2f' : '#ddd'
            }}
          />
          {formErrors.telephone && (
            <span style={styles.errorText}>{formErrors.telephone}</span>
          )}
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.formLabel} htmlFor="adresse">
            Adresse de livraison *
          </label>
          <textarea
            id="adresse"
            value={clientInfo.adresse}
            onChange={(e) => handleClientInfoChange('adresse', e.target.value)}
            placeholder="Votre adresse complète pour la livraison"
            rows="3"
            style={{
              ...styles.formTextarea,
              borderColor: formErrors.adresse ? '#d32f2f' : '#ddd'
            }}
          />
          {formErrors.adresse && (
            <span style={styles.errorText}>{formErrors.adresse}</span>
          )}
        </div>
        
        <div style={styles.orderSummary}>
          <h5 style={styles.summaryTitle}>Récapitulatif de commande</h5>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Produit :</span>
            <span style={styles.summaryValue}>{selectedProduct.nom}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Quantité :</span>
            <span style={styles.summaryValue}>{quantity}</span>
          </div>
          <div style={styles.summaryRow}>
            <span style={styles.summaryLabel}>Total :</span>
            <span style={styles.summaryTotal}>{formatPrix(totalPrice)} CFA</span>
          </div>
        </div>
      </div>
      
      <div style={styles.stepNavigation}>
        <button 
          onClick={prevStep}
          style={styles.backButton}
        >
          Retour
        </button>
        <button 
          onClick={handleOrderSubmit}
          style={styles.confirmButton}
        >
          Commander
        </button>
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      {/* Navigation */}
      <nav style={styles.navbar}>
        <div style={{
          ...styles.navContent,
          padding: getResponsivePadding()
        }}>
          <div style={styles.logoContainer}>
            <img src={logo} alt="Bouctou Poulet" style={styles.logoImage} />
            {!isMobile && (
              <div>
                <h1 style={styles.logoText}>Bouctou Poulet</h1>
                <p style={styles.logoSubtitle}>Excellence Avicole</p>
              </div>
            )}
          </div>
          
          {!isMobile ? (
            <div style={styles.navLinks}>
              <button 
                style={{
                  ...styles.navLink,
                  color: activeSection === 'accueil' ? '#FBC02D' : '#2E7D32'
                }}
                onClick={() => scrollToSection('accueil')}
              >
                Accueil
              </button>
              <button 
                style={{
                  ...styles.navLink,
                  color: activeSection === 'produits' ? '#FBC02D' : '#2E7D32'
                }}
                onClick={() => scrollToSection('produits')}
              >
                Produits
              </button>
              <button 
                style={{
                  ...styles.navLink,
                  color: activeSection === 'apropos' ? '#FBC02D' : '#2E7D32'
                }}
                onClick={() => scrollToSection('apropos')}
              >
                À propos
              </button>
              <button 
                style={{
                  ...styles.navLink,
                  color: activeSection === 'contact' ? '#FBC02D' : '#2E7D32'
                }}
                onClick={() => scrollToSection('contact')}
              >
                Contact
              </button>
            </div>
          ) : (
            <div style={styles.mobileMenu}>
              <div style={styles.mobileNavLinks}>
                <button 
                  style={{
                    ...styles.mobileNavLink,
                    color: activeSection === 'accueil' ? '#FBC02D' : '#2E7D32'
                  }}
                  onClick={() => scrollToSection('accueil')}
                >
                  Accueil
                </button>
                <button 
                  style={{
                    ...styles.mobileNavLink,
                    color: activeSection === 'produits' ? '#FBC02D' : '#2E7D32'
                  }}
                  onClick={() => scrollToSection('produits')}
                >
                  Produits
                </button>
                <button 
                  style={{
                    ...styles.mobileNavLink,
                    color: activeSection === 'apropos' ? '#FBC02D' : '#2E7D32'
                  }}
                  onClick={() => scrollToSection('apropos')}
                >
                  À propos
                </button>
                <button 
                  style={{
                    ...styles.mobileNavLink,
                    color: activeSection === 'contact' ? '#FBC02D' : '#2E7D32'
                  }}
                  onClick={() => scrollToSection('contact')}
                >
                  Contact
                </button>
              </div>
            </div>
          )}

          <Link to="/bouctou_poulet/login">
            <button style={{
              ...styles.navButton,
              padding: isMobile ? '10px 15px' : isTablet ? '12px 20px' : '14px 28px',
              fontSize: isMobile ? '0.85rem' : '0.95rem'
            }}>
              <span>{isMobile ? 'Connexion' : 'Se Connecter'}</span>
              {!isMobile && <span style={styles.buttonArrow}>→</span>}
            </button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} style={{
        ...styles.hero,
        padding: getResponsiveHeroPadding(),
        minHeight: isMobile ? '70vh' : isTablet ? '80vh' : '90vh'
      }}>
        <div style={styles.heroOverlay}></div>
        <div style={{
          ...styles.heroContent,
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(30px)'
        }}>
          <div style={styles.heroBadge}>
            <span style={styles.heroBadgeIcon}>🏆</span>
            <span>Meilleure qualité 2026</span>
          </div>
          
          <h1 style={{
            ...styles.heroTitle,
            fontSize: isMobile ? '1.8rem' : isTablet ? '2.5rem' : '3.5rem'
          }}>
            La qualité
            <span style={styles.heroHighlight}> malienne</span>
            <br />
            dans votre assiette
          </h1>
          
          <p style={{
            ...styles.heroSubtitle,
            fontSize: isMobile ? '0.9rem' : isTablet ? '1.1rem' : '1.2rem',
            padding: isMobile ? '0 10px' : '0',
            marginBottom: isMobile ? '25px' : isTablet ? '35px' : '40px'
          }}>
            Que vous soyez éleveur, revendeur, restaurant ou particulier, Bouctou Poulet vous accompagne avec des solutions adaptées au marché malien.
          </p>
          
          <div style={{
            ...styles.heroButtons,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '20px',
            marginBottom: isMobile ? '25px' : isTablet ? '35px' : '40px'
          }}>
            <Link to="/bouctou_poulet/login">
              <button style={{
                ...styles.primaryButton,
                padding: isMobile ? '12px 20px' : isTablet ? '14px 25px' : '18px 35px',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}>
                <span>Accéder à mon compte</span>
                <span style={styles.buttonArrow}>→</span>
              </button>
            </Link>
            <button 
              style={{
                ...styles.secondaryButton,
                padding: isMobile ? '12px 20px' : isTablet ? '14px 25px' : '18px 35px',
                fontSize: isMobile ? '0.85rem' : '0.95rem'
              }}
              onClick={() => scrollToSection('produits')}
            >
              Voir nos produits
            </button>
          </div>

          <div style={{
            ...styles.heroFeatures,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '8px' : '20px'
          }}>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🛡️</span>
              <span>Qualité garantie</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>🚚</span>
              <span>Livraison rapide</span>
            </div>
            <div style={styles.feature}>
              <span style={styles.featureIcon}>⭐</span>
              <span>Produits frais</span>
            </div>
          </div>
        </div>

        {!isMobile && (
          <div style={styles.floatingElements}>
            <div style={styles.floatingElement1}>🐔</div>
            <div style={styles.floatingElement2}>🥚</div>
            <div style={styles.floatingElement3}>🐣</div>
          </div>
        )}
      </section>

      {/* À propos Section */}
      <section ref={aboutRef} style={{
        ...styles.aboutSection,
        padding: getResponsiveSectionPadding()
      }}>
        <div style={{
          ...styles.aboutContainer,
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: isMobile ? '25px' : isTablet ? '40px' : '60px'
        }}>
          <div style={styles.aboutImage}>
            <div style={styles.imageWrapper}>
              <div style={styles.imageContent}>
                <div style={styles.imageBadge}>🐔</div>
                <h3 style={styles.imageTitle}>Élevage Traditionnel</h3>
                <p style={styles.imageText}>Respect de l'environnement et du bien-être animal</p>
              </div>
            </div>
          </div>
          
          <div style={styles.aboutContent}>
            <div style={styles.aboutHeader}>
              <h2 style={{
                ...styles.aboutTitle,
                fontSize: isMobile ? '1.6rem' : isTablet ? '2rem' : '2.5rem'
              }}>
                À Propos de Nous
              </h2>
            </div>
            
            <p style={{
              ...styles.aboutDescription,
              fontSize: isMobile ? '0.9rem' : '1rem',
              marginBottom: isMobile ? '20px' : '25px'
            }}>
              Bouctou Poulet est une plateforme moderne dédiée à l'élevage et à la commercialisation de poussins, d'œufs et de poulets au Mali. Nous connectons production locale et consommateurs grâce à une solution digitale simple, fiable et efficace.
              Notre mission est de valoriser l'élevage malien, garantir des produits de qualité et faciliter l'accès à des volailles saines, élevées dans le respect des normes d'hygiène et de bien-être animal.
            </p>
            
            <div style={{
              ...styles.valuesGrid,
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
              gap: isMobile ? '10px' : '15px'
            }}>
              <div style={styles.valueCard}>
                <div style={styles.valueIcon}>🌱</div>
                <h4 style={styles.valueTitle}>Naturel</h4>
                <p style={styles.valueText}>Poussins sélectionnés pour une meilleure productivité des éleveurs</p>
              </div>
              
              <div style={styles.valueCard}>
                <div style={styles.valueIcon}>🤝</div>
                <h4 style={styles.valueTitle}>Éthique</h4>
                <p style={styles.valueText}>Œufs frais et contrôlés, issus d'élevages locaux</p>
              </div>
              
              <div style={styles.valueCard}>
                <div style={styles.valueIcon}>🏆</div>
                <h4 style={styles.valueTitle}>Qualité</h4>
                <p style={styles.valueText}>Poulets de chair et poulets locaux, disponibles selon la demande</p>
              </div>
              
              <div style={styles.valueCard}>
                <div style={styles.valueIcon}>🚚</div>
                <h4 style={styles.valueTitle}>Rapidité</h4>
                <p style={styles.valueText}>Livraison en 24h maximum</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Produits Section */}
      <section ref={produitsRef} style={{
        ...styles.section,
        padding: getResponsiveSectionPadding()
      }}>
        <div style={styles.sectionHeader}>
          <div style={styles.sectionTitleContainer}>
            <div style={styles.sectionIcon}>
              <span style={{ fontSize: isMobile ? '20px' : isTablet ? '24px' : '28px' }}>🛒</span>
            </div>
            <h2 style={{
              ...styles.sectionTitle,
              fontSize: isMobile ? '1.6rem' : isTablet ? '2rem' : '2.5rem'
            }}>Nos Produits Phares</h2>
          </div>
          <p style={{
            ...styles.sectionSubtitle,
            fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.1rem',
            marginBottom: isMobile ? '25px' : isTablet ? '35px' : '40px'
          }}>
            Découvrez notre sélection de produits frais et de qualité supérieure
          </p>
        </div>

        {loadingProduits ? (
          <div style={styles.loadingContainer}>
            <div style={styles.spinner}></div>
            <p style={styles.loadingText}>Chargement des produits...</p>
          </div>
        ) : produits.length === 0 ? (
          <div style={styles.emptyContainer}>
            <span style={styles.emptyIcon}>📦</span>
            <h3 style={styles.emptyTitle}>Aucun produit disponible</h3>
            <p style={styles.emptyText}>Revenez plus tard pour découvrir nos produits</p>
          </div>
        ) : (
          <>
            <div style={{
              ...styles.productsCarouselContainer,
              position: 'relative',
              marginBottom: isMobile ? '20px' : '30px'
            }}>
              {produits.length > (isMobile ? 1 : isTablet ? 2 : 3) && (
                <>
                  <button 
                    onClick={() => scrollProducts('left')}
                    style={styles.carouselButtonLeft}
                  >
                    ‹
                  </button>
                  <button 
                    onClick={() => scrollProducts('right')}
                    style={styles.carouselButtonRight}
                  >
                    ›
                  </button>
                </>
              )}
              
              <div 
                ref={productsContainerRef}
                style={{
                  ...styles.productsCarousel,
                  overflowX: 'auto',
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none'
                }}
              >
                <div style={{
                  display: 'flex',
                  gap: isMobile ? '15px' : isTablet ? '20px' : '25px',
                  padding: '10px 0'
                }}>
                  {produits.map((produit, index) => (
                    <div
                      key={produit.id || index}
                      style={{
                        ...styles.productCard,
                        minWidth: isMobile ? '280px' : isTablet ? '300px' : '320px',
                        flexShrink: 0,
                        transform: hoveredProduct === index ? 'translateY(-5px)' : 'translateY(0)'
                      }}
                      onMouseEnter={() => !isMobile && setHoveredProduct(index)}
                      onMouseLeave={() => !isMobile && setHoveredProduct(null)}
                    >
                      <div style={styles.productImageContainer}>
                        <img
                          src={getProductImageWithFallback(produit)}
                          alt={produit.nom}
                          style={styles.productImage}
                          onError={(e) => {
                            e.target.src = defaultProductImage;
                          }}
                        />
                        <div style={styles.productCategory}>
                          <span style={styles.categoryIcon}>
                            {getProductIcon(produit.type)}
                          </span>
                          <span>{getProductTypeLabel(produit.type)}</span>
                        </div>
                      </div>

                      <div style={styles.productInfo}>
                        <h3 style={styles.productName}>{produit.nom || 'Produit sans nom'}</h3>
                        <p style={styles.productDescription}>
                          {produit.description || 'Produit de qualité supérieure'}
                        </p>
                        
                        <div style={styles.productMeta}>
                          <div style={styles.stockContainer}>
                            <span style={styles.stockLabel}>Disponibilité :</span>
                            <span style={{
                              ...styles.stockValue,
                              color: (produit.stock || 0) > 0 ? '#2E7D32' : '#d32f2f'
                            }}>
                              {(produit.stock || 0) > 0 ? `${produit.stock} unités` : 'Rupture de stock'}
                            </span>
                          </div>
                          
                          {produit.prix && (
                            <div style={styles.priceBadge}>
                              <span style={styles.priceValue}>{produit.prix}</span>
                              <span style={styles.priceUnit}>CFA</span>
                            </div>
                          )}
                        </div>
                        
                        <div style={styles.productFooter}>
                          <button 
                            style={styles.productButton} 
                            onClick={() => openOrderModal(produit)}
                            disabled={(produit.stock || 0) <= 0}
                          >
                            <span style={styles.buttonIcon}>🛒</span>
                            <span>{(produit.stock || 0) > 0 ? 'Commander' : 'Rupture'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {isMobile && produits.length > 0 && (
              <div style={styles.carouselIndicators}>
                {produits.slice(0, Math.min(5, produits.length)).map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      const container = productsContainerRef.current;
                      if (container) {
                        const scrollAmount = 280 * index;
                        container.scrollTo({ left: scrollAmount, behavior: 'smooth' });
                      }
                    }}
                    style={{
                      ...styles.carouselIndicator,
                      backgroundColor: currentSlide === index ? '#2E7D32' : '#ccc'
                    }}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

      {/* Contact Section */}
      <section ref={contactRef} style={{
        ...styles.contactSection,
        padding: getResponsiveSectionPadding()
      }}>
        <div style={styles.contactContainer}>
          <div style={styles.contactHeader}>
            <h2 style={{
              ...styles.contactTitle,
              fontSize: isMobile ? '1.6rem' : isTablet ? '2rem' : '2.5rem'
            }}>Contactez-nous</h2>
            <p style={{
              ...styles.contactSubtitle,
              fontSize: isMobile ? '0.9rem' : isTablet ? '1rem' : '1.1rem',
              marginBottom: isMobile ? '25px' : isTablet ? '35px' : '40px'
            }}>
              Nous sommes à votre écoute pour toutes vos questions
            </p>
          </div>
          
          <div style={{
            ...styles.contactGrid,
            gridTemplateColumns: isMobile ? '1fr' : isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? '20px' : isTablet ? '30px' : '40px'
          }}>
            <div style={styles.contactInfo}>
              <div style={styles.infoCard}>
                <div style={styles.infoIcon}>
                  <span style={{ fontSize: isMobile ? '16px' : isTablet ? '20px' : '22px' }}>📧</span>
                </div>
                <div>
                  <h4 style={styles.infoTitle}>Email</h4>
                  <p style={styles.infoText}>ot218053@gmail.com</p>
                </div>
              </div>
              
              <div style={styles.infoCard}>
                <div style={styles.infoIcon}>
                  <span style={{ fontSize: isMobile ? '16px' : isTablet ? '20px' : '22px' }}>📱</span>
                </div>
                <div>
                  <h4 style={styles.infoTitle}>Téléphone</h4>
                  <p style={styles.infoText}>+223 91 17 86 64</p>
                </div>
              </div>
              
              <div style={styles.infoCard}>
                <div style={styles.infoIcon}>
                  <span style={{ fontSize: isMobile ? '16px' : isTablet ? '20px' : '22px' }}>📍</span>
                </div>
                <div>
                  <h4 style={styles.infoTitle}>Adresse</h4>
                  <p style={styles.infoText}>Bamako, Mali</p>
                </div>
              </div>
              
              <div style={styles.contactHours}>
                <h4 style={styles.hoursTitle}>Horaires d'ouverture</h4>
                <p style={styles.hoursText}>Lundi - Vendredi: 8h - 18h</p>
                <p style={styles.hoursText}>Samedi: 9h - 18h</p>
                <p style={styles.hoursText}>Dimanche: 9h - 17h</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{
          ...styles.footerTop,
          padding: isMobile ? '30px 15px' : isTablet ? '40px 30px' : '60px 40px'
        }}>
          <div style={{
            ...styles.footerContainer,
            gridTemplateColumns: isMobile ? '1fr' : '1fr',
            gap: isMobile ? '25px' : isTablet ? '35px' : '40px'
          }}>
            <div style={styles.footerBrand}>
              <img src={logo} alt="Bouctou Poulet" style={styles.footerLogo} />
              <div>
                <h3 style={styles.footerBrandName}>Bouctou Poulet</h3>
                <p style={styles.footerDescription}>
                  Bouctou Poulet – Innover pour nourrir le Mali.
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div style={styles.footerBottom}>
          <div style={styles.bottomContainer}>
            <p style={styles.copyright}>
              © {new Date().getFullYear()} Bouctou Poulet. Tous droits réservés.
            </p>
            <div style={styles.paymentMethods}>
              <span style={styles.paymentIcon}>💳</span>
              <span style={styles.paymentIcon}>📱</span>
              <span style={styles.paymentIcon}>💰</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de commande */}
      {isModalOpen && selectedProduct && (
        <div style={styles.modalOverlay} onClick={closeOrderModal}>
          <div style={{
            ...styles.modal,
            width: isMobile ? '95%' : isTablet ? '450px' : '500px',
            maxWidth: '500px',
            margin: isMobile ? '20px auto' : 'auto'
          }} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <div style={styles.modalStepper}>
                <div style={{
                  ...styles.stepperStep,
                  ...(modalStep >= 1 ? styles.stepperStepActive : {})
                }}>
                  <div style={styles.stepperNumber}>1</div>
                  <span style={styles.stepperLabel}>Produit</span>
                </div>
                <div style={styles.stepperLine}></div>
                <div style={{
                  ...styles.stepperStep,
                  ...(modalStep >= 2 ? styles.stepperStepActive : {})
                }}>
                  <div style={styles.stepperNumber}>2</div>
                  <span style={styles.stepperLabel}>Quantité</span>
                </div>
                <div style={styles.stepperLine}></div>
                <div style={{
                  ...styles.stepperStep,
                  ...(modalStep >= 3 ? styles.stepperStepActive : {})
                }}>
                  <div style={styles.stepperNumber}>3</div>
                  <span style={styles.stepperLabel}>Client</span>
                </div>
              </div>
              <button 
                onClick={closeOrderModal}
                style={styles.modalCloseButton}
              >
                ×
              </button>
            </div>
            
            {modalStep === 1 && renderStep1()}
            {modalStep === 2 && renderStep2()}
            {modalStep === 3 && renderStep3()}
          </div>
        </div>
      )}
    </div>
  );
}

/* =======================
   STYLES DE BASE
======================= */

const styles = {
  container: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    overflowX: 'hidden',
    backgroundColor: '#ffffff',
  },

  /* ===== NAVIGATION ===== */
  navbar: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    background: 'rgba(255, 255, 255, 0.98)',
    backdropFilter: 'blur(20px)',
    zIndex: 1000,
    boxShadow: '0 4px 30px rgba(46, 125, 50, 0.08)',
    padding: '12px 0',
    borderBottom: '1px solid rgba(46, 125, 50, 0.1)',
  },

  navContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },

  logoContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  logoImage: {
    width: '35px',
    height: '35px',
    objectFit: 'cover',
    borderRadius: '8px',
    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.2)',
    border: '2px solid #FBC02D',
  },

  logoText: {
    fontSize: '1.1rem',
    fontWeight: '800',
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    margin: 0,
    letterSpacing: '-0.3px',
  },

  logoSubtitle: {
    fontSize: '0.65rem',
    color: '#666',
    fontWeight: '500',
    margin: '1px 0 0 0',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
  },

  navLinks: {
    display: 'flex',
    gap: '20px',
    background: 'rgba(244, 251, 246, 0.8)',
    padding: '6px 15px',
    borderRadius: '40px',
    border: '1px solid rgba(46, 125, 50, 0.1)',
  },

  navLink: {
    background: 'none',
    border: 'none',
    color: '#2E7D32',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    padding: '6px 0',
    position: 'relative',
    transition: 'all 0.3s ease',
    whiteSpace: 'nowrap',
  },

  mobileMenu: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    marginTop: '12px',
  },

  mobileNavLinks: {
    display: 'flex',
    justifyContent: 'space-around',
    width: '100%',
    padding: '8px 0',
  },

  mobileNavLink: {
    background: 'none',
    border: 'none',
    color: '#2E7D32',
    textDecoration: 'none',
    fontWeight: '600',
    fontSize: '0.85rem',
    cursor: 'pointer',
    padding: '4px',
    transition: 'all 0.3s ease',
  },

  navButton: {
    background: 'linear-gradient(135deg, #FBC02D 0%, #FFEB3B 100%)',
    color: '#4E342E',
    border: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 15px rgba(251, 192, 45, 0.3)',
    whiteSpace: 'nowrap',
  },

  buttonArrow: {
    fontSize: '1rem',
    transition: 'transform 0.3s ease',
  },

  /* ===== HERO SECTION ===== */
  hero: {
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(45deg, rgba(0,0,0,0.1) 0%, transparent 100%)',
    zIndex: 1,
  },

  heroContent: {
    maxWidth: '900px',
    textAlign: 'center',
    color: '#fff',
    zIndex: 2,
    transition: 'all 0.8s ease',
    position: 'relative',
    width: '100%',
  },

  heroBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(10px)',
    padding: '6px 12px',
    borderRadius: '40px',
    marginBottom: '15px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '0.8rem',
  },

  heroBadgeIcon: {
    fontSize: '0.9rem',
  },

  heroTitle: {
    fontWeight: '900',
    marginBottom: '15px',
    lineHeight: '1.1',
    textShadow: '0 4px 20px rgba(0, 0, 0, 0.2)',
  },

  heroHighlight: {
    color: '#FBC02D',
    textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
  },

  heroSubtitle: {
    marginBottom: '20px',
    opacity: 0.95,
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: '1.6',
    fontWeight: '400',
  },

  heroButtons: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  primaryButton: {
    background: '#FBC02D',
    color: '#4E342E',
    border: 'none',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
  },

  secondaryButton: {
    background: 'transparent',
    color: '#fff',
    border: '2px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '10px',
    fontWeight: '700',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    backdropFilter: 'blur(10px)',
  },

  heroFeatures: {
    display: 'flex',
    justifyContent: 'center',
    flexWrap: 'wrap',
  },

  feature: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'rgba(255, 255, 255, 0.1)',
    padding: '8px 15px',
    borderRadius: '40px',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    fontSize: '0.85rem',
  },

  featureIcon: {
    fontSize: '0.9rem',
  },

  floatingElements: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    pointerEvents: 'none',
  },

  floatingElement1: {
    position: 'absolute',
    top: '20%',
    left: '10%',
    fontSize: '2.5rem',
    opacity: 0.2,
    animation: 'float 20s infinite ease-in-out',
  },

  floatingElement2: {
    position: 'absolute',
    top: '40%',
    right: '15%',
    fontSize: '2rem',
    opacity: 0.2,
    animation: 'float 15s infinite ease-in-out reverse',
  },

  floatingElement3: {
    position: 'absolute',
    bottom: '20%',
    left: '15%',
    fontSize: '1.8rem',
    opacity: 0.2,
    animation: 'float 25s infinite ease-in-out',
  },

  /* ===== SECTION STYLES ===== */
  section: {
    background: '#ffffff',
  },

  sectionHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },

  sectionTitleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '8px',
  },

  sectionIcon: {
    background: 'linear-gradient(135deg, #FBC02D 0%, #FFEB3B 100%)',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#4E342E',
  },

  sectionTitle: {
    fontWeight: '900',
    color: '#2E7D32',
    margin: 0,
    lineHeight: 1.2,
  },

  sectionSubtitle: {
    color: '#666',
    maxWidth: '700px',
    margin: '0 auto',
    lineHeight: 1.6,
  },

  /* ===== PRODUCTS SECTION ===== */
  productsCarouselContainer: {
    position: 'relative',
    marginBottom: '20px',
  },

  productsCarousel: {
    overflowX: 'auto',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    '&::-webkit-scrollbar': {
      display: 'none',
    },
  },

  carouselButtonLeft: {
    position: 'absolute',
    left: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#2E7D32',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },

  carouselButtonRight: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    background: 'rgba(255, 255, 255, 0.9)',
    border: 'none',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.5rem',
    color: '#2E7D32',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    zIndex: 10,
    transition: 'all 0.3s ease',
  },

  carouselIndicators: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '15px',
  },

  carouselIndicator: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    transition: 'background-color 0.3s ease',
  },

  loadingContainer: {
    textAlign: 'center',
    padding: '40px',
  },

  spinner: {
    width: '40px',
    height: '40px',
    border: '3px solid #f4fbf6',
    borderTop: '3px solid #2E7D32',
    borderRadius: '50%',
    margin: '0 auto 15px',
    animation: 'spin 1s linear infinite',
  },

  loadingText: {
    fontSize: '0.9rem',
    color: '#2E7D32',
    fontWeight: '600',
  },

  emptyContainer: {
    textAlign: 'center',
    padding: '30px 20px',
    background: '#f4fbf6',
    borderRadius: '12px',
  },

  emptyIcon: {
    fontSize: '2.5rem',
    marginBottom: '12px',
    display: 'block',
  },

  emptyTitle: {
    fontSize: '1.3rem',
    color: '#2E7D32',
    margin: '0 0 8px 0',
  },

  emptyText: {
    fontSize: '0.9rem',
    color: '#666',
    margin: 0,
  },

  productCard: {
    background: '#fff',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: '0 8px 25px rgba(0, 0, 0, 0.08)',
    transition: 'all 0.4s ease',
    border: '1px solid rgba(46, 125, 50, 0.1)',
  },

  productImageContainer: {
    height: '180px',
    position: 'relative',
    overflow: 'hidden',
  },

  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },

  productCategory: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: '#FBC02D',
    color: '#4E342E',
    padding: '5px 10px',
    borderRadius: '40px',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    backdropFilter: 'blur(10px)',
  },

  categoryIcon: {
    fontSize: '0.8rem',
  },

  productInfo: {
    padding: '15px',
  },

  productName: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#2E7D32',
    margin: '0 0 8px 0',
    lineHeight: 1.3,
  },

  productDescription: {
    color: '#666',
    margin: '0 0 12px 0',
    fontSize: '0.85rem',
    lineHeight: 1.5,
    minHeight: '40px',
  },

  productMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
    padding: '10px',
    background: '#f4fbf6',
    borderRadius: '8px',
  },

  stockContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3px',
  },

  stockLabel: {
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: '500',
  },

  stockValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
  },

  priceBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },

  priceValue: {
    fontSize: '1.1rem',
    fontWeight: '900',
    color: '#2E7D32',
    lineHeight: 1,
  },

  priceUnit: {
    fontSize: '0.75rem',
    color: '#666',
    fontWeight: '500',
  },

  productFooter: {
    display: 'flex',
    justifyContent: 'center',
  },

  productButton: {
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    color: '#fff',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.85rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
    width: '100%',
    justifyContent: 'center',
  },

  buttonIcon: {
    fontSize: '0.9rem',
  },

  /* ===== MODAL STYLES ===== */
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
    padding: '20px',
    overflowY: 'auto',
  },

  modal: {
    background: '#fff',
    borderRadius: '15px',
    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
    overflow: 'hidden',
    animation: 'modalAppear 0.3s ease-out',
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',
  },

  modalHeader: {
    padding: '20px',
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    color: '#fff',
    position: 'relative',
  },

  modalStepper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },

  stepperStep: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '5px',
    opacity: 0.6,
  },

  stepperStepActive: {
    opacity: 1,
  },

  stepperNumber: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: 'bold',
  },

  stepperLabel: {
    fontSize: '0.7rem',
    fontWeight: '500',
    whiteSpace: 'nowrap',
  },

  stepperLine: {
    flex: 1,
    height: '2px',
    background: 'rgba(255, 255, 255, 0.2)',
    margin: '0 5px',
  },

  modalCloseButton: {
    position: 'absolute',
    top: '15px',
    right: '15px',
    background: 'none',
    border: 'none',
    color: '#fff',
    fontSize: '1.8rem',
    cursor: 'pointer',
    lineHeight: 1,
    padding: '0',
    width: '30px',
    height: '30px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'transform 0.2s ease',
  },

  modalContent: {
    padding: '20px',
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
  },

  productPreview: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    paddingBottom: '15px',
    borderBottom: '1px solid #eee',
  },

  productImageModal: {
    position: 'relative',
    width: '80px',
    height: '80px',
    borderRadius: '10px',
    overflow: 'hidden',
    flexShrink: 0,
  },

  modalImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },

  productCategoryModal: {
    position: 'absolute',
    top: '5px',
    left: '5px',
    background: '#FBC02D',
    color: '#4E342E',
    padding: '3px 6px',
    borderRadius: '20px',
    fontSize: '0.6rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '3px',
    backdropFilter: 'blur(10px)',
  },

  productDetails: {
    flex: 1,
  },

  productNameModal: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#2E7D32',
    margin: '0 0 8px 0',
    lineHeight: 1.3,
  },

  productDescriptionModal: {
    fontSize: '0.85rem',
    color: '#666',
    margin: '0 0 12px 0',
    lineHeight: 1.5
  },

  productInfoGrid: {
    display: 'grid',
    gap: '8px',
    background: '#f4fbf6',
    padding: '10px',
    borderRadius: '8px',
  },

  infoItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: '0.8rem',
    color: '#666',
    fontWeight: '500',
  },

  infoValue: {
    fontSize: '0.85rem',
    fontWeight: '700',
    color: '#2E7D32',
  },

  stepHeader: {
    marginBottom: '20px',
  },

  stepTitle: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#2E7D32',
    margin: 0,
    textAlign: 'center',
  },

  quantitySection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '20px',
  },

  quantitySelector: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },

  quantityButton: {
    background: '#f4fbf6',
    border: '2px solid #2E7D32',
    color: '#2E7D32',
    width: '45px',
    height: '45px',
    borderRadius: '10px',
    fontSize: '1.3rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },

  quantityInput: {
    width: '70px',
    textAlign: 'center',
    padding: '12px',
    border: '2px solid #ddd',
    borderRadius: '10px',
    fontSize: '1.2rem',
    fontWeight: '600',
  },

  calculationSection: {
    background: '#f4fbf6',
    padding: '15px',
    borderRadius: '10px',
  },

  calculationRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '8px',
  },

  calcLabel: {
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
  },

  calcValue: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: '#2E7D32',
  },

  totalPrice: {
    fontSize: '1.2rem',
    fontWeight: '800',
    color: '#2E7D32',
  },

  calculationFormula: {
    textAlign: 'center',
    fontSize: '0.9rem',
    color: '#666',
    fontWeight: '500',
    marginTop: '10px',
    paddingTop: '10px',
    borderTop: '1px dashed #ddd',
  },

  clientForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '20px',
  },

  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
  },

  formLabel: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2E7D32',
    marginBottom: '3px',
  },

  formInput: {
    padding: '12px 15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.95rem',
    transition: 'border-color 0.3s ease',
  },

  formTextarea: {
    padding: '12px 15px',
    border: '2px solid #ddd',
    borderRadius: '8px',
    fontSize: '0.95rem',
    resize: 'vertical',
    minHeight: '80px',
    transition: 'border-color 0.3s ease',
  },

  errorText: {
    fontSize: '0.8rem',
    color: '#d32f2f',
    marginTop: '3px',
  },

  orderSummary: {
    background: '#f4fbf6',
    padding: '15px',
    borderRadius: '10px',
    marginTop: '10px',
  },

  summaryTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    color: '#2E7D32',
    margin: '0 0 10px 0',
    textAlign: 'center',
  },

  summaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '6px',
  },

  summaryLabel: {
    fontSize: '0.85rem',
    color: '#666',
    fontWeight: '500',
  },

  summaryValue: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: '#2E7D32',
  },

  summaryTotal: {
    fontSize: '1.1rem',
    fontWeight: '800',
    color: '#2E7D32',
  },

  stepNavigation: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '10px',
    marginTop: 'auto',
    paddingTop: '20px',
    borderTop: '1px solid #eee',
  },

  backButton: {
    background: '#f5f5f5',
    color: '#333',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
  },

  nextButton: {
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    color: '#fff',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
  },

  confirmButton: {
    background: 'linear-gradient(135deg, #FBC02D 0%, #FFEB3B 100%)',
    color: '#4E342E',
    border: 'none',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    flex: 1,
  },

  /* ===== ABOUT SECTION ===== */
  aboutSection: {
    background: 'linear-gradient(135deg, #f9fdf9 0%, #f0f8f0 100%)',
  },

  aboutContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
    alignItems: 'center',
  },

  aboutImage: {
    position: 'relative',
  },

  imageWrapper: {
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    borderRadius: '15px',
    padding: '25px',
    minHeight: '350px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 15px 40px rgba(46, 125, 50, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },

  imageContent: {
    textAlign: 'center',
    color: '#fff',
    zIndex: 2,
    position: 'relative',
  },

  imageBadge: {
    fontSize: '2.5rem',
    marginBottom: '15px',
    display: 'inline-block',
  },

  imageTitle: {
    fontSize: '1.5rem',
    fontWeight: '800',
    marginBottom: '8px',
  },

  imageText: {
    fontSize: '0.9rem',
    opacity: 0.9,
    maxWidth: '250px',
    margin: '0 auto',
    lineHeight: 1.5,
  },

  aboutContent: {
    maxWidth: '500px',
  },

  aboutHeader: {
    marginBottom: '20px',
  },

  aboutTitle: {
    fontWeight: '900',
    color: '#2E7D32',
    marginBottom: '8px',
    lineHeight: 1.2,
  },

  aboutDescription: {
    color: '#555',
    lineHeight: 1.6,
    marginBottom: '25px',
  },

  valuesGrid: {
    display: 'grid',
  },

  valueCard: {
    background: '#fff',
    padding: '15px',
    borderRadius: '12px',
    textAlign: 'center',
    boxShadow: '0 8px 25px rgba(46, 125, 50, 0.1)',
    border: '1px solid rgba(46, 125, 50, 0.1)',
    transition: 'transform 0.3s ease',
  },

  valueIcon: {
    fontSize: '1.8rem',
    marginBottom: '10px',
    display: 'block',
  },

  valueTitle: {
    fontSize: '1rem',
    fontWeight: '800',
    color: '#2E7D32',
    margin: '0 0 5px 0',
  },

  valueText: {
    fontSize: '0.8rem',
    color: '#666',
    margin: 0,
    lineHeight: 1.4,
  },

  /* ===== CONTACT SECTION ===== */
  contactSection: {
    background: '#ffffff',
  },

  contactContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
  },

  contactHeader: {
    textAlign: 'center',
    marginBottom: '30px',
  },

  contactTitle: {
    fontWeight: '900',
    color: '#2E7D32',
    marginBottom: '8px',
  },

  contactSubtitle: {
    color: '#666',
    maxWidth: '600px',
    margin: '0 auto',
  },

  contactGrid: {
    display: 'grid',
  },

  contactInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },

  infoCard: {
    background: '#f9fdf9',
    padding: '15px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    border: '1px solid rgba(46, 125, 50, 0.1)',
    transition: 'all 0.3s ease',
  },

  infoIcon: {
    background: 'rgba(46, 125, 50, 0.1)',
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  infoTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#2E7D32',
    margin: '0 0 3px 0',
  },

  infoText: {
    fontSize: '0.85rem',
    color: '#666',
    margin: 0,
  },

  contactHours: {
    background: 'linear-gradient(135deg, #2E7D32 0%, #66BB6A 100%)',
    padding: '20px',
    borderRadius: '12px',
    color: '#fff',
    marginTop: '10px',
  },

  hoursTitle: {
    fontSize: '1rem',
    fontWeight: '700',
    margin: '0 0 10px 0',
  },

  hoursText: {
    fontSize: '0.85rem',
    margin: '3px 0',
    opacity: 0.9,
  },

  /* ===== FOOTER ===== */
  footer: {
    background: 'linear-gradient(135deg, #1B5E20 0%, #2E7D32 100%)',
    color: '#fff',
    overflow: 'hidden',
  },

  footerTop: {
  },

  footerContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'grid',
  },

  footerBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
  },

  footerLogo: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
    borderRadius: '10px',
    backgroundColor: '#fff',
    padding: '5px',
    boxShadow: '0 6px 20px rgba(0, 0, 0, 0.3)',
    border: '2px solid #FBC02D',
  },

  footerBrandName: {
    fontSize: '1.3rem',
    fontWeight: '900',
    margin: '0 0 3px 0',
  },

  footerDescription: {
    fontSize: '0.85rem',
    opacity: 0.7,
    lineHeight: 1.5,
    margin: 0,
  },

  footerBottom: {
    background: 'rgba(0, 0, 0, 0.1)',
    padding: '15px',
  },

  bottomContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },

  copyright: {
    fontSize: '0.8rem',
    opacity: 0.7,
    margin: 0,
    textAlign: 'center',
  },

  paymentMethods: {
    display: 'flex',
    gap: '10px',
  },

  paymentIcon: {
    fontSize: '1.2rem',
    opacity: 0.7,
    transition: 'opacity 0.3s ease',
  },
};