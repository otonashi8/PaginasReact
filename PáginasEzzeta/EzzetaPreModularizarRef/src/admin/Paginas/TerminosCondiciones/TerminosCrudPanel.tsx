import { LegalEditor } from '../PoliticaPrivacidad/PoliticasCrudPanel';
import { getLegalPage } from '../paginasStorage';

export const TerminosCrudPanel = () => <LegalEditor initial={getLegalPage('terms')} />;