import profile from '../assets/profile.png';
import PropTypes from 'prop-types';

export function AgentHeader({ title, serviceName, agentName, guichetLetter }) {
    return (
        <div className="bg-white rounded-2xl shadow-md p-6 mb-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold text-gray-800">{title}</h1>
                        <span className="px-4 py-2 bg-customRed text-white rounded-lg text-sm font-semibold">
                            {serviceName || 'Service'}
                        </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                        {new Date().toLocaleDateString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        })}
                    </p>
                </div>

                <div className="flex items-center gap-6 mt-4 md:mt-0">
                    <div className="flex items-center gap-3">
                        <div className="text-right">
                            <p className="font-bold text-gray-800">
                                <span className="text-customRed">AGENT</span> {agentName || ''}
                            </p>
                            <p className="text-sm text-gray-600">
                                Guichet: <span className="font-semibold text-customRed">{guichetLetter || 'Non assigné'}</span>
                            </p>
                        </div>
                        <img
                            src={profile}
                            className="h-12 w-12 rounded-full border-2 border-customRed"
                            alt="Profil agent"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

AgentHeader.propTypes = {
    title: PropTypes.string.isRequired,
    serviceName: PropTypes.string,
    agentName: PropTypes.string,
    guichetLetter: PropTypes.string,
};

export default AgentHeader;

