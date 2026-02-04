import { useEffect, useState } from 'react';
import profile from '../../assets/profile.png';
import Navbar from '../../components/Navbar';
import {Input} from "../../components/forms/Input.jsx";
import axios from "axios";

export function GestionUtilisateur() {

    const [showForm, setShowForm] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [editUserId, setEditUserId] = useState(null);
    const [formData, setFormData] = useState({
        nom: '',
        postnom: '',
        prenom: '',
        email: '',
        idService: '',
        motDePasse: '',
        role: 'agent'
    });
    const [loading, setLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    // état pour la réduction de la barre latérale
    const [navCollapsed, setNavCollapsed] = useState(false);

    useEffect(() => {
        fetchUsers();
        fetchServices();
    }, []);

    const toggleNav = () => {
        setNavCollapsed(prev => !prev);
    }

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/users");
            // On retire le mot de passe côté front par sécurité
            // on renomme la variable pour indiquer qu'on l'ignore volontairement
            const usersSansMdp = response.data.map(({ motDePasse: _motDePasse, ...user }) => user);
            setUsers(usersSansMdp);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/services");
            setServices(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des services :", error);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleEdit = (user) => {
        setEditMode(true);
        setEditUserId(user.id);
        setFormData({
            nom: user.nom || '',
            postnom: user.postnom || '',
            prenom: user.prenom || '',
            email: user.email || '',
            idService: user.idService || '',
            motDePasse: '', // On ne pré-remplit jamais le mot de passe
            role: user.role || 'utilisateur'
        });
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if(window.confirm('Voulez-vous vraiment supprimer cet utilisateur ?')) {
            try {
                await axios.delete(`http://localhost:4000/api/users/${id}`);
                await fetchUsers();
            } catch (error) {
                console.error("Erreur lors de la suppression de l'utilisateur :", error);
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if(editMode && editUserId) {
                await axios.put(`http://localhost:4000/api/users/${editUserId}`, formData);
            } else {
                await axios.post("http://localhost:4000/api/register", formData);
            }
            await fetchUsers();
            setShowForm(false);
            setFormData({
                nom: '',
                postnom: '',
                prenom: '',
                email: '',
                idService: '',
                motDePasse: '',
                role: 'utilisateur'
            });
            setEditMode(false);
            setEditUserId(null);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="h-screen flex bg-customRed">
            <div className={`h-screen ${navCollapsed ? 'w-20' : 'w-96'} bg-customRed flex justify-center`}>
                <Navbar collapsed={navCollapsed}/>
             </div>
             {/* Contenu Principal */}
             {showForm && (
                <>
                    <div className="fixed inset-0 bg-black opacity-70 z-10"></div>
                    <div className="fixed bg-white w-96 z-20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-10 rounded-lg shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                name="nom"
                                placeholder="Nom"
                                label="Nom"
                                value={formData.nom}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="text"
                                name="postnom"
                                placeholder="Postnom"
                                label="Postnom"
                                value={formData.postnom}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="text"
                                name="prenom"
                                placeholder="Prénom"
                                label="Prénom"
                                value={formData.prenom}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="email"
                                name="email"
                                placeholder="Email"
                                label="Email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                            />
                            {/* Liste déroulante des services */}
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Service</label>
                                <select
                                    name="idService"
                                    value={formData.idService}
                                    onChange={handleChange}
                                    className="w-full border rounded px-3 py-2"
                                    required
                                >
                                    <option value="">Sélectionner un service</option>
                                    {services.map(service => (
                                        <option key={service.id} value={service.id}>{service.nomService || service.nomservice}</option>
                                    ))}
                                </select>
                            </div>
                            <Input
                                type="password"
                                name="motDePasse"
                                placeholder="Mot de passe"
                                label="Mot de passe"
                                value={formData.motDePasse}
                                onChange={handleChange}
                                required={!editMode}
                            />
                            {/* Champ caché pour le rôle */}
                            <input type="hidden" name="role" value={formData.role} />
                            <button
                                type="submit"
                                className="w-full font-comfortaa rounded-lg h-10 mt-5 text-white bg-green-600"
                                disabled={loading}
                            >
                                {loading ? "Ajout..." : "Valider"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="w-full font-comfortaa rounded-lg h-10 mt-5 text-white bg-customRed"
                            >
                                Annuler
                            </button>
                        </form>
                    </div>
                </>
            )}
            <div className="bg-white w-full">
                <div className='items-center justify-between flex ml-10 mr-10 mt-10'>
                    {/* Bouton pour réduire/agrandir la sidebar */}
                    <button onClick={toggleNav} className="mr-4 p-2 rounded bg-gray-100">
                        <span className="material-icons">{navCollapsed ? 'chevron_right' : 'chevron_left'}</span>
                    </button>
                    <div className='justify-start'>
                        <p className='text-4xl font-roboto font-bold'>Gestion des agents</p>
                    </div>
                    <div className='flex items-center'>
                        <span className='pr-2 font-roboto font-bold'>Alghufar Sanajab</span>
                        <img src={profile} alt="Profil" className='h-10'/>
                    </div>
                </div>
                <div className="p-10">
                    <div className="flex justify-between items-center mb-5">
                        <h2 className="text-2xl font-bold">Liste des utilisateurs</h2>
                        <button onClick={() => setShowForm(true)}  className="bg-customRed text-white px-4 py-2 rounded-lg">Ajouter un utilisateur</button>
                    </div>

                    <table className="w-full border-collapse border border-gray-300">
                        <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-gray-300 p-2">Nom</th>
                            <th className="border border-gray-300 p-2">Email</th>
                            <th className="border border-gray-300 p-2">Service</th>
                            <th className="border border-gray-300 p-2">Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((user) => {
                            const service = services.find(s => s.id === Number(user.idService));
                            return (
                                <tr className="text-center" key={user.id}>
                                    <td className="border border-gray-300 p-2">{user.nom} {user.postnom} {user.prenom}</td>
                                    <td className="border border-gray-300 p-2">{user.email}</td>
                                    <td className="border border-gray-300 p-2">{service ? (service.nomService || service.nomservice) : user.idService}</td>
                                    <td className="border border-gray-300 p-2">
                                        <button
                                            className="bg-blue-500 text-white px-3 py-1 rounded mr-2"
                                            onClick={() => handleEdit(user)}
                                        >
                                            Modifier
                                        </button>
                                        <button
                                            className="bg-red-500 text-white px-3 py-1 rounded"
                                            onClick={() => handleDelete(user.id)}
                                        >
                                            Supprimer
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        </tbody>
                    </table>
                </div>

            </div>
        </div>
    );
}
