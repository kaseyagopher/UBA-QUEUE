import { useEffect, useState, useContext } from 'react';
import { Input } from "../../components/forms/Input.jsx";
import axios from "axios";
import AdminContext from '../../contexts/AdminContext';
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";

export function GestionUtilisateur() {
    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Gestion des agents');
    }, [setTitle]);

    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);
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
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [users, setUsers] = useState([]);
    const [services, setServices] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchServices();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/users");
            const usersSansMdp = response.data.map(user => {
                const copy = { ...user };
                delete copy.motDePasse;
                return copy;
            });
            setUsers(usersSansMdp);
        } catch (error) {
            console.error("Erreur lors de la récupération des utilisateurs :", error);
            toast.error("Erreur lors du chargement des utilisateurs");
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
            motDePasse: '',
            role: user.role || 'agent'
        });
        setShowForm(true);
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        setDeleteLoading(true);
        try {
            await axios.delete(`http://localhost:4000/api/users/${userToDelete.id}`);
            await fetchUsers();
            toast.success("Utilisateur supprimé avec succès !");
            setShowDeleteConfirm(false);
            setUserToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression de l'utilisateur :", error);
            toast.error("Erreur lors de la suppression");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setUserToDelete(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (editMode && editUserId) {
                await axios.put(`http://localhost:4000/api/users/${editUserId}`, formData);
                toast.success("Utilisateur modifié avec succès !");
            } else {
                await axios.post("http://localhost:4000/api/register", formData);
                toast.success("Utilisateur ajouté avec succès !");
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
                role: 'agent'
            });
            setEditMode(false);
            setEditUserId(null);
        } catch (error) {
            console.error("Erreur lors de l'enregistrement de l'utilisateur :", error);
            toast.error("Erreur lors de l'enregistrement");
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadgeColor = (role) => {
        switch (role?.toLowerCase()) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'agent':
                return 'bg-blue-100 text-blue-800';
            case 'utilisateur':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusBadge = (user) => {
        const statuses = ['Active', 'Pending', 'Inactive'];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

        switch (randomStatus) {
            case 'Active':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
            case 'Pending':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
            case 'Inactive':
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
            default:
                return <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">-</span>;
        }
    };

    const filteredUsers = users.filter(user => {
        const fullName = `${user.nom} ${user.postnom} ${user.prenom}`.toLowerCase();
        const email = user.email?.toLowerCase() || '';
        const service = services.find(s => s.id === Number(user.idService));
        const serviceName = service ? (service.nomService || service.nomservice).toLowerCase() : '';

        return fullName.includes(searchTerm.toLowerCase()) ||
            email.includes(searchTerm.toLowerCase()) ||
            serviceName.includes(searchTerm.toLowerCase()) ||
            user.role?.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <>
            <ToastContainer />

            {/* Overlay pour formulaire */}
            {showForm && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>

                    {/* Formulaire centré */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-fadeIn">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editMode ? 'Modifier l\'utilisateur' : 'Ajouter un utilisateur'}
                                </h2>
                                <button
                                    onClick={() => setShowForm(false)}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <span className="material-icons text-gray-500">close</span>
                                </button>
                            </div>

                            <div className="max-h-[70vh] overflow-y-auto p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Nom *
                                            </label>
                                            <input
                                                type="text"
                                                name="nom"
                                                placeholder="Dupont"
                                                value={formData.nom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Postnom *
                                            </label>
                                            <input
                                                type="text"
                                                name="postnom"
                                                placeholder="Martin"
                                                value={formData.postnom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Prénom *
                                            </label>
                                            <input
                                                type="text"
                                                name="prenom"
                                                placeholder="Jean"
                                                value={formData.prenom}
                                                onChange={handleChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Email *
                                        </label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                email
                                            </span>
                                            <input
                                                type="email"
                                                name="email"
                                                placeholder="jean.dupont@example.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Service *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="idService"
                                                    value={formData.idService}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent appearance-none bg-white transition-all"
                                                    required
                                                >
                                                    <option value="">Sélectionner un service</option>
                                                    {services.map(service => (
                                                        <option key={service.id} value={service.id}>
                                                            {service.nomService || service.nomservice}
                                                        </option>
                                                    ))}
                                                </select>
                                                <span className="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Rôle *
                                            </label>
                                            <div className="relative">
                                                <select
                                                    name="role"
                                                    value={formData.role}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent appearance-none bg-white transition-all"
                                                    required
                                                >
                                                    <option value="agent">Agent</option>
                                                    <option value="admin">Admin</option>
                                                    <option value="utilisateur">Utilisateur</option>
                                                </select>
                                                <span className="material-icons absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                                                    expand_more
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Mot de passe {!editMode && '*'}
                                        </label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                lock
                                            </span>
                                            <input
                                                type="password"
                                                name="motDePasse"
                                                placeholder={editMode ? "Laisser vide pour ne pas changer" : "********"}
                                                value={formData.motDePasse}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                                required={!editMode}
                                            />
                                        </div>
                                        {editMode && (
                                            <p className="mt-2 text-sm text-gray-500">
                                                Laisser vide pour garder le mot de passe actuel
                                            </p>
                                        )}
                                    </div>
                                </form>
                            </div>

                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => setShowForm(false)}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[120px]"
                                >
                                    <span className="material-icons mr-2">close</span>
                                    Annuler
                                </button>
                                <button
                                    type="submit"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-6 py-3 bg-customRed text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <span className="material-icons animate-spin mr-2">refresh</span>
                                            Traitement...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons mr-2">check</span>
                                            {editMode ? 'Modifier' : 'Ajouter'}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Popup de confirmation de suppression */}
            {showDeleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"></div>

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fadeIn">
                            {/* En-tête avec icône d'avertissement */}
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                                    <span className="material-icons text-3xl text-red-600">warning</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                                    Confirmer la suppression
                                </h2>
                                <p className="text-gray-600 text-center">
                                    Êtes-vous sûr de vouloir supprimer cet utilisateur ?
                                </p>
                            </div>

                            {/* Informations sur l'utilisateur */}
                            {userToDelete && (
                                <div className="p-6 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-gradient-to-r from-customRed to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {userToDelete.nom?.charAt(0)}{userToDelete.prenom?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {userToDelete.nom} {userToDelete.postnom} {userToDelete.prenom}
                                            </h3>
                                            <p className="text-sm text-gray-600">
                                                {userToDelete.email}
                                            </p>
                                            <p className="text-sm text-gray-600 mt-1">
                                                Rôle: <span className="font-medium">{userToDelete.role}</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Message d'avertissement */}
                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500">
                                <div className="flex">
                                    <span className="material-icons text-amber-500 mr-3">info</span>
                                    <div>
                                        <p className="text-sm text-amber-800">
                                            Cette action est irréversible. Toutes les données associées à cet utilisateur seront définitivement supprimées.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Boutons d'action */}
                            <div className="flex justify-end gap-4 p-6">
                                <button
                                    type="button"
                                    onClick={handleDeleteCancel}
                                    disabled={deleteLoading}
                                    className="px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
                                >
                                    <span className="material-icons mr-2">close</span>
                                    Annuler
                                </button>
                                <button
                                    type="button"
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteLoading}
                                    className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {deleteLoading ? (
                                        <>
                                            <span className="material-icons animate-spin mr-2">refresh</span>
                                            Suppression...
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons mr-2">delete</span>
                                            Supprimer
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Contenu principal */}
            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <p className="text-gray-600 mt-1">{users.length} utilisateur(s) au total</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Rechercher un utilisateur..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={() => {
                                setShowForm(true);
                                setEditMode(false);
                                setEditUserId(null);
                                setFormData({
                                    nom: '',
                                    postnom: '',
                                    prenom: '',
                                    email: '',
                                    idService: '',
                                    motDePasse: '',
                                    role: 'agent'
                                });
                            }}
                            className="bg-customRed hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors whitespace-nowrap"
                        >
                            <span className="material-icons mr-2">add</span>
                            Ajouter un utilisateur
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto rounded-lg border border-gray-200">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Utilisateur</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Email</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Service</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Rôle</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Statut</th>
                            <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                        </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                        {filteredUsers.length > 0 ? (
                            filteredUsers.map((user) => {
                                const service = services.find(s => s.id === Number(user.idService));
                                return (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 flex-shrink-0 bg-gradient-to-r from-customRed to-red-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {user.nom?.charAt(0)}{user.prenom?.charAt(0)}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium text-gray-900">
                                                        {user.nom} {user.postnom} {user.prenom}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        ID: #{user.id?.toString().padStart(6, '0')}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="text-gray-900">{user.email}</div>
                                        </td>
                                        <td className="py-4 px-4">
                                                <span className="text-gray-900">
                                                    {service ? (service.nomService || service.nomservice) : 'N/A'}
                                                </span>
                                        </td>
                                        <td className="py-4 px-4">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                                    {user.role || '-'}
                                                </span>
                                        </td>
                                        <td className="py-4 px-4">
                                            {getStatusBadge(user)}
                                        </td>
                                        <td className="py-4 px-4">
                                            <div className="flex space-x-2">
                                                <button
                                                    className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                    onClick={() => handleEdit(user)}
                                                    title="Modifier"
                                                >
                                                    <span className="material-icons text-sm">edit</span>
                                                </button>
                                                <button
                                                    className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                    onClick={() => handleDeleteClick(user)}
                                                    title="Supprimer"
                                                >
                                                    <span className="material-icons text-sm">delete</span>
                                                </button>
                                                <button
                                                    className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                                                    title="Voir détails"
                                                >
                                                    <span className="material-icons text-sm">visibility</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-8 px-4 text-center text-gray-500">
                                    {searchTerm ? 'Aucun utilisateur trouvé' : 'Aucun utilisateur disponible'}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>

                <div className="flex items-center justify-between mt-6">
                    <div className="text-sm text-gray-500">
                        Affichage de {filteredUsers.length} sur {users.length} utilisateurs
                    </div>
                    <div className="flex space-x-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            Précédent
                        </button>
                        <button className="px-3 py-1 bg-customRed text-white rounded-md text-sm hover:bg-red-700">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            2
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50">
                            Suivant
                        </button>
                    </div>
                </div>
            </div>

            {/* Ajouter l'animation dans votre fichier CSS global */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: scale(0.95) translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: scale(1) translateY(0);
                    }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </>
    );
}