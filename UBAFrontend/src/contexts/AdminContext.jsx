import { createContext } from 'react';

const AdminContext = createContext({
  title: '',
  setTitle: () => {}
});

export default AdminContext;
