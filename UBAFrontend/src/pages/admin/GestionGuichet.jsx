import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/ReactToastify.css";
import AdminContext from '../../contexts/AdminContext';

export function GestionGuichet() {
    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Gestion des Guichets');
    }, [setTitle]);

    // États
    const [showForm, setShowForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showAssignAgentModal, setShowAssignAgentModal] = useState(false);
    const [guichetToDelete, setGuichetToDelete] = useState(null);
    const [guichetToAssign, setGuichetToAssign] = useState(null);

    const [editMode, setEditMode] = useState(false);
    const [editId, setEditId] = useState(null);

    const [formData, setFormData] = useState({
        lettre: "",
        idService: "",
        idUtilisateur: ""
    });

    const [guichets, setGuichets] = useState([]);
    const [services, setServices] = useState([]);
    const [agents, setAgents] = useState([]);
    const [lettresDisponibles, setLettresDisponibles] = useState([]);

    const [loading, setLoading] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [assignLoading, setAssignLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchGuichets();
        fetchServices();
        fetchAgents();
    }, []);

    useEffect(() => {
        if (formData.idService && !editMode) {
            fetchLettresDisponibles(formData.idService);
        }
    }, [formData.idService]);

    const fetchGuichets = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/guichets");
            setGuichets(response.data);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error("Erreur chargement des guichets");
        }
    };

    const fetchServices = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/services");
            setServices(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const fetchAgents = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/users?role=agent");
            setAgents(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const fetchLettresDisponibles = async (serviceId) => {
        try {
            const response = await axios.get(`http://localhost:4000/api/guichets/lettres-disponibles/${serviceId}`);
            setLettresDisponibles(response.data);
        } catch (error) {
            console.error("Erreur:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddClick = () => {
        setEditMode(false);
        setEditId(null);
        setFormData({
            lettre: "",
            idService: "",
            idUtilisateur: ""
        });
        setShowForm(true);
    };

    const handleEditClick = (guichet) => {
        setEditMode(true);
        setEditId(guichet.id);
        setFormData({
            lettre: guichet.lettre,
            idService: guichet.idService?.toString() || "",
            idUtilisateur: guichet.idUtilisateur?.toString() || ""
        });
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (editMode) {
                await axios.put(`http://localhost:4000/api/guichets/${editId}`, formData);
                toast.success("Guichet modifié !");
            } else {
                await axios.post("http://localhost:4000/api/guichets", formData);
                toast.success("Guichet ajouté !");
            }

            fetchGuichets();
            setShowForm(false);
            setEditMode(false);
            setEditId(null);

        } catch (error) {
            console.error("Erreur:", error);
            toast.error(error.response?.data?.message || "Erreur");
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteClick = (guichet) => {
        setGuichetToDelete(guichet);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (!guichetToDelete) return;

        setDeleteLoading(true);
        try {
            await axios.delete(`http://localhost:4000/api/guichets/${guichetToDelete.id}`);
            setGuichets(guichets.filter(g => g.id !== guichetToDelete.id));
            toast.success("Guichet supprimé !");
            setShowDeleteConfirm(false);
            setGuichetToDelete(null);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(error.response?.data?.message || "Erreur");
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleAssignClick = (guichet) => {
        setGuichetToAssign(guichet);
        setFormData(prev => ({ ...prev, idUtilisateur: guichet.idUtilisateur?.toString() || "" }));
        setShowAssignAgentModal(true);
    };

    const handleAssignConfirm = async () => {
        if (!guichetToAssign) return;

        setAssignLoading(true);
        try {
            await axios.patch(`http://localhost:4000/api/guichets/${guichetToAssign.id}/assigner-agent`, {
                idUtilisateur: formData.idUtilisateur || null
            });

            toast.success(formData.idUtilisateur ? "Agent assigné !" : "Agent retiré !");
            fetchGuichets();
            setShowAssignAgentModal(false);
            setGuichetToAssign(null);
        } catch (error) {
            console.error("Erreur:", error);
            toast.error(error.response?.data?.message || "Erreur");
        } finally {
            setAssignLoading(false);
        }
    };

    const filteredGuichets = guichets.filter(g =>
        g.lettre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.serviceNom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        g.agentNom?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <ToastContainer />

            {/* Modal Formulaire */}
            {showForm && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl animate-fadeIn">
                            <div className="flex justify-between items-center p-6 border-b">
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {editMode ? 'Modifier Guichet' : 'Ajouter Guichet'}
                                </h2>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full">
                                    <span className="material-icons">close</span>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                {/* Service */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Service *
                                    </label>
                                    <select
                                        name="idService"
                                        value={formData.idService}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-customRed"
                                        required
                                        disabled={editMode}
                                    >
                                        <option value="">Sélectionner</option>
                                        {services.map(s => (
                                            <option key={s.id} value={s.id}>
                                                {s.nomService || s.nomservice}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Lettre */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Lettre du guichet *
                                    </label>
                                    <select
                                        name="lettre"
                                        value={formData.lettre}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-customRed"
                                        required
                                    >
                                        <option value="">Sélectionner</option>
                                        {editMode ? (
                                            <option value={formData.lettre}>{formData.lettre}</option>
                                        ) : (
                                            lettresDisponibles.map(l => (
                                                <option key={l} value={l}>Guichet {l}</option>
                                            ))
                                        )}
                                    </select>
                                    {!editMode && formData.idService && lettresDisponibles.length === 0 && (
                                        <p className="text-sm text-red-500 mt-1">
                                            Aucune lettre disponible pour ce service
                                        </p>
                                    )}
                                </div>

                                {/* Agent (optionnel) */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Agent assigné
                                    </label>
                                    <select
                                        name="idUtilisateur"
                                        value={formData.idUtilisateur}
                                        onChange={handleChange}
                                        className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-customRed"
                                    >
                                        <option value="">Aucun agent</option>
                                        {agents.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.nom} {a.prenom}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Boutons */}
                                <div className="flex justify-end gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setShowForm(false)}
                                        className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-50"
                                    >
                                        Annuler
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-6 py-3 bg-customRed text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                                    >
                                        {loading ? (
                                            <span className="material-icons animate-spin mr-2">refresh</span>
                                        ) : (
                                            <span className="material-icons mr-2">{editMode ? 'edit' : 'add'}</span>
                                        )}
                                        {editMode ? 'Modifier' : 'Ajouter'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </>
            )}

            {/* Modal Assignation Agent */}
            {showAssignAgentModal && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
                            <div className="p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-800">
                                    Assigner un agent
                                </h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Guichet {guichetToAssign?.lettre} - {guichetToAssign?.serviceNom}
                                </p>
                            </div>

                            <div className="p-6">
                                <select
                                    name="idUtilisateur"
                                    value={formData.idUtilisateur}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 border rounded-lg"
                                >
                                    <option value="">Aucun agent (désassigner)</option>
                                    {agents.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {a.nom} {a.prenom}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                                <button
                                    onClick={() => {
                                        setShowAssignAgentModal(false);
                                        setGuichetToAssign(null);
                                    }}
                                    className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleAssignConfirm}
                                    disabled={assignLoading}
                                    className="px-6 py-3 bg-customRed text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {assignLoading ? (
                                        <span className="material-icons animate-spin mr-2">refresh</span>
                                    ) : (
                                        <span className="material-icons mr-2">check</span>
                                    )}
                                    Confirmer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal Confirmation Suppression */}
            {showDeleteConfirm && (
                <>
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"></div>
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl">
                            <div className="p-6 text-center">
                                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-icons text-3xl text-red-600">warning</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">
                                    Supprimer le guichet ?
                                </h2>
                                <p className="text-gray-600">
                                    Guichet {guichetToDelete?.lettre} - {guichetToDelete?.serviceNom}
                                </p>
                            </div>

                            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
                                <button
                                    onClick={() => {
                                        setShowDeleteConfirm(false);
                                        setGuichetToDelete(null);
                                    }}
                                    className="px-6 py-3 border rounded-lg text-gray-700 hover:bg-gray-100"
                                >
                                    Annuler
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    disabled={deleteLoading}
                                    className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center"
                                >
                                    {deleteLoading ? (
                                        <span className="material-icons animate-spin mr-2">refresh</span>
                                    ) : (
                                        <span className="material-icons mr-2">delete</span>
                                    )}
                                    Supprimer
                                </button>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Contenu principal */}
            <div className="bg-white rounded-xl shadow-md p-6">
                {/* En-tête */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <div>
                        <p className="text-gray-600 mt-1">{guichets.length} guichet(s)</p>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:flex-initial">
                            <span className="material-icons absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                search
                            </span>
                            <input
                                type="text"
                                placeholder="Rechercher..."
                                className="pl-10 pr-4 py-2 border rounded-lg w-full focus:ring-2 focus:ring-customRed"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button
                            onClick={handleAddClick}
                            className="bg-customRed text-white px-4 py-2 rounded-lg flex items-center whitespace-nowrap hover:bg-red-700"
                        >
                            <span className="material-icons mr-2">add</span>
                            Ajouter
                        </button>
                    </div>
                </div>

                {/* Liste des guichets en cartes */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredGuichets.length > 0 ? (
                        filteredGuichets.map(guichet => (
                            <div key={guichet.id} className="bg-white border rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                                            <span className="material-icons text-blue-600 text-2xl">
                                                countertops
                                            </span>
                                        </div>
                                        <div>
                                            <span className="text-2xl font-bold text-gray-900">
                                                {guichet.lettre}
                                            </span>
                                            <span className="block text-sm text-gray-600">
                                                {guichet.serviceNom}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                <div className="border-t pt-4">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center">
                                            <span className="material-icons text-sm text-gray-500 mr-2">person</span>
                                            {guichet.agentNom ? (
                                                <span className="text-sm font-medium text-gray-700">
                                                    {guichet.agentNom}
                                                </span>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">
                                                    Non assigné
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex space-x-1">
                                            <button
                                                onClick={() => handleAssignClick(guichet)}
                                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                                title="Assigner agent"
                                            >
                                                <span className="material-icons text-sm">assignment_ind</span>
                                            </button>
                                            <button
                                                onClick={() => handleEditClick(guichet)}
                                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                                                title="Modifier"
                                            >
                                                <span className="material-icons text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(guichet)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                                                title="Supprimer"
                                            >
                                                <span className="material-icons text-sm">delete</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t">
                                    <div className="text-center bg-gray-50 p-2 rounded-lg">
                                        <span className="text-xs text-gray-500">Aujourd'hui</span>
                                        <p className="text-lg font-bold text-gray-800">{guichet.ticketsAujourdhui || 0}</p>
                                    </div>
                                    <div className="text-center bg-gray-50 p-2 rounded-lg">
                                        <span className="text-xs text-gray-500">En attente</span>
                                        <p className="text-lg font-bold text-orange-600">{guichet.ticketsEnAttente || 0}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-span-full text-center py-12">
                            <span className="material-icons text-gray-400 text-5xl mb-4">countertops</span>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                {searchTerm ? 'Aucun guichet trouvé' : 'Aucun guichet'}
                            </h3>
                            <p className="text-gray-500">
                                {searchTerm ? 'Essayez autre recherche' : 'Ajoutez votre premier guichet'}
                            </p>
                        </div>
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95) translateY(-10px); }
                    to { opacity: 1; transform: scale(1) translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.2s ease-out;
                }
            `}</style>
        </>
    );
}