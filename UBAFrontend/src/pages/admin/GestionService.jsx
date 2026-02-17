import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/ReactToastify.css"
import AdminContext from '../../contexts/AdminContext';

export function GestionService() {
    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Gestion des Services');
    }, [setTitle]);

    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [serviceToDelete, setServiceToDelete] = useState(null);

    // AJOUTER CES ÉTATS
    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        nomservice: "",
        descriptionService: ""
    });
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/services");
            setServices(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des services :", error);
            toast.error("Erreur lors du chargement des services");
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // FONCTION POUR OUVRIR LE FORMULAIRE EN MODE AJOUT
    const handleAddClick = () => {
        setEditMode(false);
        setEditId(null);
        setFormData({ nomservice: "", descriptionService: "" });
        setShowForm(true);
    };

    // FONCTION POUR OUVRIR LE FORMULAIRE EN MODE ÉDITION
    const handleEditClick = (service) => {
        setEditMode(true);
        setEditId(service.id);
        setFormData({
            nomservice: service.nomService || service.nomservice,
            descriptionService: service.description || service.descriptionService
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let response;

            if (editMode) {
                // MODE ÉDITION : PUT
                response = await axios.put(`http://localhost:4000/api/services/${editId}`, formData);

                // Mettre à jour la liste des services
                setServices(services.map(service =>
                    service.id === editId
                        ? {
                            ...service,
                            nomService: formData.nomservice,
                            description: formData.descriptionService
                        }
                        : service
                ));

                toast.success("Service modifié avec succès !");
            } else {
                // MODE AJOUT : POST
                response = await axios.post("http://localhost:4000/api/services", formData);

                if (response.data) {
                    setServices([...services, {
                        id: response.data.id,
                        nomService: response.data.nomService || formData.nomservice,
                        description: response.data.description || formData.descriptionService
                    }]);

                    toast.success("Service ajouté avec succès !");
                }
            }

            // Fermer le formulaire et réinitialiser
            setShowForm(false);
            setFormData({ nomservice: "", descriptionService: "" });
            setEditMode(false);
            setEditId(null);

        } catch (error) {
            console.error("Erreur :", error);
            toast.error(error.response?.data?.message || "Erreur lors de l'opération");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (service) => {
        setServiceToDelete(service);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!serviceToDelete) return;

        setDeleteLoading(true);
        try {
            await axios.delete(`http://localhost:4000/api/services/${serviceToDelete.id}`);
            setServices(services.filter(service => service.id !== serviceToDelete.id));
            toast.success("Service supprimé avec succès !");
            setShowDeleteConfirm(false);
            setServiceToDelete(null);
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
            toast.error(error.response?.data?.message || "Erreur lors de la suppression");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleDeleteCancel = () => {
        setShowDeleteConfirm(false);
        setServiceToDelete(null);
    };

    const filteredServices = services.filter(service => {
        const serviceName = (service.nomService || service.nomservice || '').toLowerCase();
        const serviceDesc = (service.description || service.descriptionService || '').toLowerCase();

        return serviceName.includes(searchTerm.toLowerCase()) ||
            serviceDesc.includes(searchTerm.toLowerCase());
    });

    const getServiceColor = (index) => {
        const colors = [
            'bg-gradient-to-r from-blue-500 to-blue-600',
            'bg-gradient-to-r from-green-500 to-green-600',
            'bg-gradient-to-r from-purple-500 to-purple-600',
            'bg-gradient-to-r from-orange-500 to-orange-600',
            'bg-gradient-to-r from-red-500 to-red-600',
            'bg-gradient-to-r from-teal-500 to-teal-600',
            'bg-gradient-to-r from-pink-500 to-pink-600',
            'bg-gradient-to-r from-indigo-500 to-indigo-600'
        ];
        return colors[index % colors.length];
    };

    return (
        <>
            <ToastContainer/>

            {/* Overlay et Formulaire d'ajout/modification */}
            {showForm && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>

                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl animate-fadeIn">
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editMode ? 'Modifier le Service' : 'Ajouter un Service'}
                                </h2>
                                <button
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditMode(false);
                                        setEditId(null);
                                        setFormData({ nomservice: "", descriptionService: "" });
                                    }}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <span className="material-icons text-gray-500">close</span>
                                </button>
                            </div>

                            <div className="p-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Nom du service *
                                        </label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                                category
                                            </span>
                                            <input
                                                type="text"
                                                name="nomservice"
                                                placeholder="Ex: Service Client, Support Technique"
                                                value={formData.nomservice}
                                                onChange={handleChange}
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <div className="relative">
                                            <span className="material-icons absolute left-3 top-3 text-gray-400">
                                                description
                                            </span>
                                            <textarea
                                                name="descriptionService"
                                                placeholder="Décrivez les responsabilités et fonctionnalités de ce service..."
                                                value={formData.descriptionService}
                                                onChange={handleChange}
                                                rows="4"
                                                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent transition-all resize-none"
                                                required
                                            />
                                        </div>
                                    </div>
                                </form>
                            </div>

                            <div className="flex justify-end gap-4 p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false);
                                        setEditMode(false);
                                        setEditId(null);
                                        setFormData({ nomservice: "", descriptionService: "" });
                                    }}
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
                                            {editMode ? "Modification..." : "Ajout..."}
                                        </>
                                    ) : (
                                        <>
                                            <span className="material-icons mr-2">{editMode ? 'edit' : 'check'}</span>
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
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full">
                                    <span className="material-icons text-3xl text-red-600">warning</span>
                                </div>
                                <h2 className="text-2xl font-bold text-gray-800 text-center mb-2">
                                    Confirmer la suppression
                                </h2>
                                <p className="text-gray-600 text-center">
                                    Êtes-vous sûr de vouloir supprimer ce service ?
                                </p>
                            </div>

                            {serviceToDelete && (
                                <div className="p-6 bg-gray-50 border-b border-gray-200">
                                    <div className="flex items-center space-x-4">
                                        <div className="h-12 w-12 bg-gradient-to-r from-customRed to-red-500 rounded-full flex items-center justify-center text-white font-bold text-lg">
                                            {(serviceToDelete.nomService || serviceToDelete.nomservice)?.charAt(0)}
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-800">
                                                {serviceToDelete.nomService || serviceToDelete.nomservice}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                                                {serviceToDelete.description || serviceToDelete.descriptionService}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="p-4 bg-amber-50 border-l-4 border-amber-500">
                                <div className="flex">
                                    <span className="material-icons text-amber-500 mr-3">info</span>
                                    <div>
                                        <p className="text-sm text-amber-800">
                                            Cette action est irréversible. Tous les agents associés à ce service devront être réaffectés.
                                        </p>
                                    </div>
                                </div>
                            </div>

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

            <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <p className="text-gray-600 mt-1">{services.length} service(s) au total</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                        <div className="relative">
                            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">search</span>
                            <input
                                type="text"
                                placeholder="Rechercher un service..."
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-customRed focus:border-transparent w-full"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleAddClick}  // UTILISER handleAddClick
                            className="bg-customRed hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center transition-colors whitespace-nowrap"
                        >
                            <span className="material-icons mr-2">add_circle_outline</span>
                            Ajouter un Service
                        </button>
                    </div>
                </div>

                {/* Version Carte */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                    {filteredServices.length > 0 ? (
                        filteredServices.map((service, index) => (
                            <div key={service.id || `temp-${index}`} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                                <div className={`h-2 ${getServiceColor(index)}`}></div>
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                                                {service.nomService || service.nomservice}
                                            </h3>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span className="material-icons text-xs mr-1">code</span>
                                                ID: #{service.id?.toString().padStart(4, '0')}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick(service)}
                                            className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                            title="Supprimer"
                                        >
                                            <span className="material-icons">delete</span>
                                        </button>
                                    </div>

                                    <div className="mb-6">
                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {service.description || service.descriptionService}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                                        <div className="flex items-center text-gray-500">
                                            <span className="material-icons text-sm mr-1">people</span>
                                            <span>0 agents</span>
                                        </div>
                                        <div className="text-gray-500">
                                            Créé le {new Date(service.created_at).toLocaleDateString('fr-FR')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-3">
                            <div className="text-center py-12">
                                <span className="material-icons text-gray-400 text-6xl mb-4">category</span>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    {searchTerm ? 'Aucun service trouvé' : 'Aucun service disponible'}
                                </h3>
                                <p className="text-gray-500 mb-6">
                                    {searchTerm ? 'Essayez avec d\'autres termes de recherche' : 'Commencez par ajouter votre premier service'}
                                </p>
                                {!searchTerm && (
                                    <button
                                        onClick={handleAddClick}
                                        className="bg-customRed hover:bg-red-700 text-white px-6 py-2 rounded-lg inline-flex items-center"
                                    >
                                        <span className="material-icons mr-2">add</span>
                                        Ajouter un Service
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Version Tableau */}
                {filteredServices.length > 0 && (
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Service</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Description</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Agents</th>
                                <th className="py-3 px-4 text-left text-sm font-semibold text-gray-700">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {filteredServices.map((service, index) => (
                                <tr key={service.id || `temp-${index}`} className="hover:bg-gray-50 transition-colors">
                                    <td className="py-4 px-4">
                                        <div className="flex items-center">
                                            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${getServiceColor(index)}`}>
                                                    <span className="material-icons text-white text-sm">
                                                        category
                                                    </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="font-medium text-gray-900">
                                                    {service.nomService || service.nomservice}
                                                </div>
                                                <div className="text-sm text-gray-500">
                                                    ID: #{service.id?.toString().padStart(4, '0')}
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="text-gray-600 max-w-md">
                                            <p className="line-clamp-2">
                                                {service.description || service.descriptionService}
                                            </p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                <span className="material-icons text-xs mr-1">people</span>
                                                0 agents
                                            </span>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex space-x-2">
                                            <button
                                                className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                onClick={() => handleEditClick(service)}  // UTILISER handleEditClick
                                                title="Modifier"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                            </button>
                                            <button
                                                className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                                onClick={() => handleDeleteClick(service)}
                                                title="Supprimer"
                                            >
                                                <span className="material-icons text-sm">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <style>{`
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
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