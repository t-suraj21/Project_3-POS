import { useState, useEffect } from "react";
import api from "../services/api";

/**
 * useCustomerManagement
 * Manages customer selection, editing, and CRUD operations
 * 
 * Returns:
 * - customers: Array of saved customers
 * - selectedCustomerId: Currently selected customer ID
 * - activeCustomer: Currently active customer object (name, phone, address, id)
 * - handleCustomerSelect: Select customer from dropdown
 * - setActiveCustomer: Update active customer data
 * - loadCustomers: Refresh customer list from API
 */
export const useCustomerManagement = (initialCustomer = {}) => {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [activeCustomer, setActiveCustomer] = useState({
    id: initialCustomer.id || null,
    name: initialCustomer.name || "",
    phone: initialCustomer.phone || "",
    address: initialCustomer.address || "",
  });

  // Load customers from API
  const loadCustomers = useEffect(() => {
    api
      .get("/api/accounts/customers?limit=200")
      .then((r) => setCustomers(r.data?.customers || []))
      .catch((err) => console.error("Failed to load customers:", err));
  }, []);

  // Handle customer selection from dropdown
  const handleCustomerSelect = (e) => {
    const val = e.target.value;
    setSelectedCustomerId(val);
    if (val) {
      const customer = customers.find((c) => String(c.id) === val);
      if (customer) {
        setActiveCustomer({
          id: customer.id,
          name: customer.name || "",
          phone: customer.phone || "",
          address: customer.address || "",
        });
      }
    } else {
      setActiveCustomer({ id: null, name: "", phone: "", address: "" });
    }
  };

  // Update individual customer field
  const updateCustomerField = (field, value) => {
    setActiveCustomer((prev) => ({ ...prev, [field]: value }));
  };

  return {
    customers,
    selectedCustomerId,
    activeCustomer,
    handleCustomerSelect,
    setActiveCustomer,
    updateCustomerField,
    loadCustomers,
  };
};

export default useCustomerManagement;
