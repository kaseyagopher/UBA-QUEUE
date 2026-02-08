import { useState, useEffect, useContext } from 'react';

import AdminContext from '../../contexts/AdminContext';

export function GestionGuichets() {
    const { setTitle } = useContext(AdminContext);

    useEffect(() => {
        setTitle('Gestion des Guichets');
    }, [setTitle]);

    const [guichets, setGuichets] = useState([
        { id: 1, nom: "Guichet 1", status: "Ouvert" },
        { id: 2, nom: "Guichet 2", status: "Fermé" },
    ]);

    const ajouterGuichet = () => {
        const nouveauGuichet = { id: guichets.length + 1, nom: `Guichet ${guichets.length + 1}`, status: "Ouvert" };
        setGuichets([...guichets, nouveauGuichet]);
    };

    const supprimerGuichet = (id) => {
        setGuichets(guichets.filter(guichet => guichet.id !== id));
    };

    return (
        <>
            <div>
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-2xl font-bold">Liste des Guichets</h2>
                    <button onClick={ajouterGuichet} className="bg-customRed text-white px-4 py-2 rounded-lg">Ajouter un Guichet</button>
                </div>

                <table className="w-full border-collapse border border-gray-300">
                    <thead>
                    <tr className="bg-gray-100">
                        <th className="border border-gray-300 p-2">Nom</th>
                        <th className="border border-gray-300 p-2">Statut</th>
                        <th className="border border-gray-300 p-2">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {guichets.map(guichet => (
                        <tr key={guichet.id} className="text-center">
                            <td className="border border-gray-300 p-2">{guichet.nom}</td>
                            <td className="border border-gray-300 p-2">{guichet.status}</td>
                            <td className="border border-gray-300 p-2">
                                <button onClick={() => supprimerGuichet(guichet.id)} className="bg-red-500 text-white px-3 py-1 rounded">Supprimer</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </>
    );
}
