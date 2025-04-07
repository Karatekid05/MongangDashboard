import api from './api';

// Check if we're in mock mode
const useMockData = process.env.REACT_APP_MOCK_API === 'true';
console.log('Gang service mock mode:', useMockData, process.env.REACT_APP_MOCK_API);

/**
 * Get all gangs with optional filtering
 * @param {Object} options - Filter options
 * @param {string} [options.searchTerm] - Search term for gang name
 * @param {string} [options.sortBy] - Field to sort by
 * @param {number} [options.page=1] - Page number for pagination
 * @param {number} [options.limit=10] - Number of results per page
 * @returns {Promise<Object>} Result object with gangs and pagination info
 */
export const getGangs = async (options = {}) => {
  const { searchTerm, sortBy, page = 1, limit = 10 } = options;

  try {
    console.log('Fetching gangs from API with params:', {
      search: searchTerm,
      sort: sortBy,
      page,
      limit,
      url: `${api.defaults.baseURL}/gangs`
    });

    const response = await api.get('/gangs', {
      params: {
        search: searchTerm,
        sort: sortBy,
        page,
        limit
      },
      headers: {
        'X-Debug': 'true',
        'X-Client-Version': '1.0.0'
      }
    });

    console.log('API response status:', response.status);
    console.log('API response data type:', Array.isArray(response.data) ? 'array' : typeof response.data);
    console.log('API first item sample:', Array.isArray(response.data) && response.data.length > 0 ? response.data[0] : 'No items');

    let gangsData;

    // Se a resposta for um array, normalizamos e encapsulamos
    if (Array.isArray(response.data)) {
      console.log('Resposta é um array com', response.data.length, 'items');

      // Normalizar os dados para garantir que cada gang tenha um ID
      const normalizedGangs = response.data.map(gang => {
        // Clone o objeto para evitar modificar o original
        const normalizedGang = { ...gang };

        // Garantir que temos um ID primário em 'id'
        if (!normalizedGang.id) {
          normalizedGang.id = normalizedGang.gangId || normalizedGang._id || `unknown-${Math.random().toString(36).substring(2, 9)}`;
        }

        return normalizedGang;
      });

      gangsData = {
        gangs: normalizedGangs,
        totalCount: normalizedGangs.length,
        totalPages: 1
      };
    } else if (response.data && typeof response.data === 'object') {
      console.log('Resposta é um objeto');

      // Se já for um objeto com um campo gangs, verificamos se ele existe e é um array
      if (response.data.gangs && Array.isArray(response.data.gangs)) {
        // Normalizar os dados para garantir que cada gang tenha um ID
        const normalizedGangs = response.data.gangs.map(gang => {
          // Clone o objeto para evitar modificar o original
          const normalizedGang = { ...gang };

          // Garantir que temos um ID primário em 'id'
          if (!normalizedGang.id) {
            normalizedGang.id = normalizedGang.gangId || normalizedGang._id || `unknown-${Math.random().toString(36).substring(2, 9)}`;
          }

          return normalizedGang;
        });

        gangsData = {
          ...response.data,
          gangs: normalizedGangs
        };
      } else {
        // Se não tiver um campo gangs, usamos o objeto como está
        gangsData = response.data;
      }
    } else {
      console.error('Resposta da API não é nem um array nem um objeto:', response.data);
      gangsData = {
        gangs: [],
        totalCount: 0,
        totalPages: 0,
        error: 'Formato de resposta inválido'
      };
    }

    return gangsData;
  } catch (error) {
    console.error('Error fetching gangs:', error);
    console.error('Error details:', error.response ? error.response.data : error.message);

    // Retorna um objeto vazio com array gangs vazio para evitar erros de renderização
    return {
      gangs: [],
      totalCount: 0,
      totalPages: 0,
      error: error.message
    };
  }
};

/**
 * Get a gang by ID
 * @param {string} gangId - Gang ID
 * @returns {Promise<Object>} Gang data
 */
export const getGangById = async (gangId) => {
  try {
    console.log(`Fetching gang details for ID: ${gangId}`);
    console.log(`Full URL: ${api.defaults.baseURL}/gangs/${gangId}`);

    // Enviar mais cabeçalhos de debug
    const response = await api.get(`/gangs/${gangId}`, {
      headers: {
        'X-Debug': 'true',
        'X-Client-Version': '1.0.0'
      }
    });

    console.log('Gang details response status:', response.status);
    console.log('Gang details response data:', response.data);

    // Verifique se o ID está sendo retornado corretamente, caso contrário, adicione-o
    const gangData = response.data;

    // Verificar se o objeto tem as propriedades esperadas
    if (!gangData || typeof gangData !== 'object') {
      console.error('Resposta inválida do servidor:', gangData);
      throw new Error('Resposta inválida do servidor');
    }

    // Padronizar o ID para garantir que temos um campo 'id'
    if (!gangData.id && !gangData.gangId && !gangData._id) {
      console.log('Adding ID to gang data');
      gangData.id = gangId; // Use o ID que foi passado como parâmetro
    } else if (!gangData.id) {
      // Se não tiver 'id', use gangId ou _id
      gangData.id = gangData.gangId || gangData._id;
    }

    return gangData;
  } catch (error) {
    console.error(`Error fetching gang with ID ${gangId}:`, error);
    console.error('Error status:', error.response ? error.response.status : 'No response');
    console.error('Error details:', error.response ? error.response.data : error.message);

    // Mensagem personalizada para código 404
    let errorMessage = `Failed to load gang details: ${error.message}`;
    if (error.response && error.response.status === 404) {
      errorMessage = `Failed to load gang details: Request failed with status code 404`;

      // Se temos uma mensagem de erro do servidor, use-a
      if (error.response.data && error.response.data.msg) {
        errorMessage = `Failed to load gang details: ${error.response.data.msg}`;
      }
    }

    // Retorna um objeto vazio com mensagem de erro para exibição
    return {
      error: errorMessage,
      id: gangId,
      name: 'Unknown Gang',
      description: 'Could not load description'
    };
  }
};

/**
 * Get gang members
 * @param {string} gangId - Gang ID
 * @returns {Promise<Array>} Gang members
 */
export const getGangMembers = async (gangId) => {
  try {
    console.log(`Fetching members for gang ID: ${gangId}`);
    const response = await api.get(`/gangs/${gangId}/members`);
    console.log('Gang members response:', response.data);

    return response.data;
  } catch (error) {
    console.error(`Error fetching members for gang with ID ${gangId}:`, error);
    console.error('Error details:', error.response ? error.response.data : error.message);

    // Retorna um objeto vazio com mensagem de erro para exibição
    return {
      members: [],
      error: `Failed to load gang members: ${error.message}`
    };
  }
};

/**
 * Get gang activity
 * @param {string} gangId - Gang ID
 * @param {Object} options - Filter options
 * @param {number} [options.page=1] - Page number
 * @param {number} [options.limit=20] - Results per page
 * @returns {Promise<Object>} Activity data with pagination
 */
export const getGangActivity = async (gangId, options = {}) => {
  const { page = 1, limit = 20 } = options;

  try {
    console.log(`Fetching activity for gang ID: ${gangId}`);
    const response = await api.get(`/gangs/${gangId}/activity`, {
      params: { page, limit }
    });
    console.log('Gang activity response:', response.data);

    return response.data;
  } catch (error) {
    console.error(`Error fetching activity for gang with ID ${gangId}:`, error);
    console.error('Error details:', error.response ? error.response.data : error.message);

    // Retorna um objeto vazio com mensagem de erro para exibição
    return {
      activities: [],
      totalCount: 0,
      totalPages: 0,
      error: `Failed to load gang activity: ${error.message}`
    };
  }
};

/**
 * Get gang statistics
 * @param {string} gangId - Gang ID
 * @returns {Promise<Object>} Gang statistics
 */
export const getGangStats = async (gangId) => {
  try {
    console.log(`Fetching statistics for gang ID: ${gangId}`);
    const response = await api.get(`/gangs/${gangId}/stats`);
    console.log('Gang stats response:', response.data);

    return response.data;
  } catch (error) {
    console.error(`Error fetching statistics for gang with ID ${gangId}:`, error);
    console.error('Error details:', error.response ? error.response.data : error.message);

    // Retorna um objeto vazio com valores padrão
    return {
      totalPoints: 0,
      weeklyPoints: 0,
      memberCount: 0,
      messageCount: 0,
      weeklyProgress: 0,
      error: `Failed to load gang statistics: ${error.message}`
    };
  }
};

/**
 * Create a new gang
 * @param {Object} gangData - Gang data
 * @returns {Promise<Object>} Created gang
 */
export const createGang = async (gangData) => {
  try {
    const response = await api.post('/gangs', gangData);
    return response.data;
  } catch (error) {
    console.error('Error creating gang:', error);
    throw error;
  }
};

/**
 * Update a gang
 * @param {string} gangId - Gang ID
 * @param {Object} gangData - Updated gang data
 * @returns {Promise<Object>} Updated gang
 */
export const updateGang = async (gangId, gangData) => {
  try {
    const response = await api.put(`/gangs/${gangId}`, gangData);
    return response.data;
  } catch (error) {
    console.error(`Error updating gang with ID ${gangId}:`, error);
    throw error;
  }
};

/**
 * Delete a gang
 * @param {string} gangId - Gang ID
 * @returns {Promise<Object>} Result
 */
export const deleteGang = async (gangId) => {
  try {
    const response = await api.delete(`/gangs/${gangId}`);
    return response.data;
  } catch (error) {
    console.error(`Error deleting gang with ID ${gangId}:`, error);
    throw error;
  }
}; 