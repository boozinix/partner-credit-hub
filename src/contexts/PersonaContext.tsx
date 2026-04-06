import { createContext, useContext, useState, type ReactNode } from "react";

export interface CustomerPersona {
  name: string;
  email: string;
  company: string;
  initials: string;
}

export const CUSTOMER_PERSONAS: CustomerPersona[] = [
  { name: "Alex Rivera", email: "ops@techforward.com", company: "TechForward Solutions", initials: "AR" },
  { name: "Jordan Patel", email: "finance@globaledge.net", company: "GlobalEdge Networks", initials: "JP" },
  { name: "Morgan Liu", email: "procurement@apexcloud.co", company: "Apex Cloud Services", initials: "ML" },
  { name: "Casey Nguyen", email: "cloud@redwoodanalytics.io", company: "Redwood Analytics", initials: "CN" },
  { name: "Dana Kowalski", email: "ops@meridiandata.com", company: "Meridian Data", initials: "DK" },
];

interface PersonaContextType {
  persona: CustomerPersona;
  setPersona: (p: CustomerPersona) => void;
}

const PersonaContext = createContext<PersonaContextType>({
  persona: CUSTOMER_PERSONAS[0],
  setPersona: () => {},
});

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersona] = useState<CustomerPersona>(CUSTOMER_PERSONAS[0]);
  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>
      {children}
    </PersonaContext.Provider>
  );
}

export function usePersona() {
  return useContext(PersonaContext);
}
