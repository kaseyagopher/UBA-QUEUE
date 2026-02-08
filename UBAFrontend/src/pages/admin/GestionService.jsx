import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { Input } from "../../components/forms/Input.jsx";
import {toast, ToastContainer} from "react-toastify"
import "react-toastify/ReactToastify.css"

import AdminContext from '../../contexts/AdminContext';

export function GestionService() {

    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Gestion des Services');
    }, [setTitle]);

    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ nomservice: "", descriptionService: "" });
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await axios.get("http://localhost:4000/api/services");
            setServices(response.data);
        } catch (error) {
            console.error("Erreur lors de la récupération des services :", error);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
    
        try {
            const response = await axios.post("http://localhost:4000/api/services", formData);
    
            if (response.data) {
                setServices([...services, {
                    id: response.data.id,
                    nomService: response.data.nomService || formData.nomservice,
                    description: response.data.description || formData.descriptionService
                }]);
    
                toast.success("Service ajouté avec succès !", { position: "top-right", autoClose: 3000 });
            }
    
            setShowForm(false);
            setFormData({ nomservice: "", descriptionService: "" });
        } catch (error) {
            console.error("Erreur lors de l'ajout du service :", error);
            toast.error("Erreur lors de l'ajout du service", { position: "top-right", autoClose: 3000 });
        } finally {
            setLoading(false);
        }
    };

    const supprimerService = async (id) => {
        const confirmation = window.confirm("Voulez-vous vraiment supprimer ce service ?");
        if (!confirmation) return;

        try {
            await axios.delete(`http://localhost:4000/api/services/${id}`);
            setServices(services.filter(service => service.id !== id));
        } catch (error) {
            console.error("Erreur lors de la suppression :", error);
        }
    };

    return (
        <>
            <ToastContainer/>

            {/* Overlay et Formulaire */}
            {showForm && (
                <>
                    <div className="fixed inset-0 bg-black opacity-70 z-10"></div>
                    <div className="fixed bg-white w-96 z-20 left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 p-10 rounded-lg shadow-lg">
                        <form onSubmit={handleSubmit}>
                            <Input
                                type="text"
                                name="nomservice"
                                placeholder="Entrer le nom du service"
                                label="Nom du service"
                                value={formData.nomservice}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                type="text"
                                name="descriptionService"
                                placeholder="Description"
                                label="Description du service"
                                value={formData.descriptionService}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="submit"
                                className="w-full font-comfortaa rounded-lg h-10 mt-5 text-white bg-green-600 flex justify-center items-center"
                                disabled={loading}
                            >
                                <span className="material-icons pr-4">done</span>
                                {loading ? "Ajout..." : "Valider"}
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                className="w-full font-comfortaa rounded-lg h-10 mt-5 text-white bg-customRed flex justify-center items-center"
                            >
                                <span className="material-icons pr-4">close</span>
                                Annuler
                            </button>
                        </form>
                    </div>
                </>
            )}

            <div>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold">Liste des Services</h2>
                    <button onClick={() => setShowForm(true)} className="bg-customRed hover:bg-red-700 text-white px-4 py-2 rounded-lg items-center flex">
                         <span className="material-icons pr-4">add_circle_outline</span>
                         Ajouter un Service
                    </button>
                </div>

                {/* Tableau des Services */}
                <div className="h-[500px] overflow-y-auto border border-gray-300 rounded-lg">
                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="sticky top-0">
                            <tr className="bg-gray-100">
                                <th className="border border-gray-300 p-2">Noms</th>
                                <th className="border border-gray-300 p-2">Descriptions</th>
                                <th className="border border-gray-300 p-2">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length > 0 ? (
                                services.map((service, index) => (
                                    <tr key={service.id || `temp-${index}`} className="text-center">
                                        <td className="border border-gray-300 p-2">{service.nomService || service.nomservice}</td>
                                        <td className="border border-gray-300 p-2">{service.description || service.descriptionService}</td>
                                        <td className="border border-gray-300 p-2">
                                            <button
                                                onClick={() => supprimerService(service.id)}
                                                className="bg    hover:bg-red-700 text-white px-3 py-1 rounded justify-center flex items-center"
                                            >
                                                <span className="material-icons pr-2">delete</span>
                                                Supprimer
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="3" className="border border-gray-300 p-2 text-center">
                                        Aucun service disponible
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
