import React, { useState, useEffect } from 'react';
import '../styles/PersonalAccount.css'

export default function UserProfileEditor ({ setIsPersonalAccountOpen }) {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    password: ''
  });
  const [editingField, setEditingField] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem('jwtToken');
        const response = await fetch('/api/user-info', {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json' // Явно запрашиваем JSON
          }
        });
        
        // Проверяем Content-Type
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Server did not return JSON');
        }
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setUserData(data);
        setIsLoading(false);
      } catch (error) {
        setMessage({ 
          text: error.message || 'Failed to fetch user data', 
          type: 'error' 
        });
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleEditClick = (fieldName) => {
    setEditingField(fieldName);
    setNewValue(userData[fieldName] || '');
  };

  const handleCancelEdit = () => {
    setEditingField(null);
    setNewValue('');
  };

  const handleSave = async () => {
    if (!newValue.trim()) {
      setMessage({ text: 'Value cannot be empty', type: 'error' });
      return;
    }

    try {
      const token = localStorage.getItem('jwtToken');
      const response = await fetch('/api/change-data', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          field_name: editingField,
          new_value: newValue
        })
      });

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Server did not return JSON');
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setUserData({ ...userData, [editingField]: newValue });
      setMessage({ text: result.status || 'Data updated successfully', type: 'success' });
      setEditingField(null);
      setNewValue('');
    } catch (error) {
      setMessage({ 
        text: error.message || 'Failed to update data', 
        type: 'error' 
      });
    }
  };

  const editableFields = [
    { name: 'name', label: 'Name' },
    { name: 'email', label: 'Email' },
    { name: 'phone', label: 'Phone' },
    { name: 'address', label: 'Address' },
    { name: 'password', label: 'Password', type: 'password' }
  ];

  if (isLoading) {
    return <div>Loading user data...</div>;
  }

  return (
    <div className="modal-overlay" onClick={() => setIsPersonalAccountOpen(false)}>
      <button 
        className="close-button"
        style={{'left':'700px'}}
      >
        ×
      </button>
      <div className="modal-content" style={{'width':'600px'}} onClick={(e) => e.stopPropagation()}>
        <div className="user-profile-editor">
          <h2>User Profile</h2>
          
          {message.text && (
            <div className={`message ${message.type === 'success' ? 'message-success' : 'message-error'}`}>
              {message.text}
            </div>
          )}

          <div className="user-info">
            {editableFields.map((field) => (
              <div key={field.name} className="info-item">
                <span className="label">{field.label}:</span>
                
                {editingField === field.name ? (
                  <div className="edit-mode">
                    <input
                      type={field.type || 'text'}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="edit-input"
                    />
                    <button onClick={handleSave} className="btn btn-save">Save</button>
                    <button onClick={handleCancelEdit} className="btn btn-cancel">Cancel</button>
                  </div>
                ) : (
                  <div className="view-mode">
                    <span className="value">
                      {field.name === 'password' ? '********' : (userData[field.name] || 'Not set')}
                    </span>
                    <button onClick={() => handleEditClick(field.name)} className="btn btn-edit">Edit</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  
  );
}
