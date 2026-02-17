import { useEffect, useState } from 'react'
import logoUba from '../../assets/logo-uba.png'
import { Input } from '../../components/forms/Input'
import axios from 'axios'
export function Services(){

    useEffect(()=>{
        document.title = "Client-Portail"
    },[])

    const [showForm, setShowForm] = useState(false)
    // liste des services récupérés depuis le backend
    const [services, setServices] = useState([])
    const [loadingServices, setLoadingServices] = useState(true)
    // id du service sélectionné
    const [selectedServiceId, setSelectedServiceId] = useState(null)
    const [selectedServiceName, setSelectedServiceName] = useState('')
    const[formData, setFormData] = useState({ nom: '', postnom: '', prenom:''});

    // Ajout d'états pour le chargement et le succès
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)


    const toogleForm = () => {
        setShowForm(!showForm)
    }



    const handleServiceClik = (service) =>{
        // service = { id, nomService, ... }
        setSelectedServiceId(service.id)
        setSelectedServiceName(service.nomService || service.nom || '')
        setShowForm(true)
    }

    const handleChange = (e) => {
        console.log("Modification détectée :", e.target.name, e.target.value);
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    useEffect(() => {
      // Charger les services depuis l'API
      const load = async () => {
        try {
          setLoadingServices(true)
          const res = await axios.get('http://localhost:4000/api/services')
          setServices(res.data || [])
        } catch (err) {
          console.error('Erreur chargement services', err)
          setServices([])
        } finally {
          setLoadingServices(false)
        }
      }
      load()
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault();

        console.log("FormData avant envoi :", formData);
        setIsSubmitting(true)

        try {
            await axios.post('http://localhost:4000/api/clients', {
                nom: formData.nom,
                postnom: formData.postnom,
                prenom: formData.prenom,
                idService: selectedServiceId,
            });

            // afficher animation de succès
            setShowSuccess(true)
            setIsSubmitting(false)

            // après une courte attente, fermer la modal et réinitialiser
            setTimeout(()=>{
                setShowForm(false)
                setShowSuccess(false)
                setFormData({ nom: '', postnom: '', prenom: '' })
                setSelectedServiceId(null)
                setSelectedServiceName('')
            }, 1400)

        } catch (error) {
            setIsSubmitting(false)
            console.error("Erreur lors de l'enregistrement :", error);
        }
    };


    return<div className='h-screen p-5'>
        <div>
            <div className='flex items-center italic'>
                <img src={logoUba} alt="Logo UBA" className='h-16 w-auto' /> <span className='text-4xl text-customRed'>SERVICES</span>
            </div>
            <p className='italic text-xl'>BIENVENU SUR LE PORTAIL CLIENT, CHOISISSEZ VOTRE SERVICE</p>
        </div>


        {showForm && (
            <div className='fixed top-0 left-0 w-full h-full bg-black bg-opacity-70 z-10 ' onClick={toogleForm}
            />
        )}

        {showForm && (
            <div className='absolute rounded-3xl bg-white w-96 z-20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2'>
                {/* Afficher l'animation de succès si success */}
                {showSuccess ? (
                    <div className='p-20 flex items-center justify-center  '>
                        <div className='relative'>
                            <span className='absolute inline-flex h-24 w-24 rounded-full bg-green-400 opacity-75 animate-ping'></span>
                            <div className='relative flex items-center justify-center h-24 w-24 rounded-full bg-green-600 text-white'>
                                <svg className='w-12 h-12' viewBox='0 0 24 24' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' xmlns='http://www.w3.org/2000/svg'>
                                    <path d='M20 6L9 17l-5-5' />
                                </svg>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form action="" onSubmit={handleSubmit} method="post" className='p-10'>
                        <div className="text-xl font-bold ">
                            Veuillez renseignez vos informations
                        </div>
                        {selectedServiceName && (
                          <div className='mt-2 mb-4 text-sm text-gray-600'>Service sélectionné : <strong>{selectedServiceName}</strong></div>
                        )}
                    <Input
                        type="text"
                        name="nom"
                        placeholder="Entrer votre nom"
                        label="Nom"
                        value={formData.nom}
                        onChange={handleChange}
                    />

                    <Input
                    type="text"
                    name="postnom"
                    placeholder="Entrer votre postnom"
                    label="Post-nom"
                    value={formData.postnom}
                    onChange={handleChange}
                    />

                    <Input
                    type="text"
                    name="prenom"
                    placeholder="Entrer votre prénom"
                    label="Prénom"
                    value={formData.prenom}
                    onChange={handleChange}
                    />

                    <button type="submit" className="w-full font-comfortaa rounded-lg h-10 mt-5 text-white bg-green-600 disabled:opacity-50" disabled={isSubmitting || !selectedServiceId}>
                        {isSubmitting ? 'Enregistrement...' : 'Valider'}
                    </button>
                        <button type="button" onClick={toogleForm} className='w-full font-comfortaa rounded-lg h-10 mt-5 text-white bg-customRed'>Annuler</button>
                    </form>
                )}
            </div>
        )}

        <div className=' pt-5 pb-5 grid gap-12 lg:grid-cols-2 lg:grid-rows-2'>

            {/* Affiche les services récupérés */}
            {loadingServices ? (
              <div>Chargement des services...</div>
            ) : (
              services.map(s => (
                <button key={s.id} className='services-option' onClick={()=> handleServiceClik(s)}>{s.nomService || s.nom || s.name}</button>
              ))
            )}
        </div>
    </div>
}