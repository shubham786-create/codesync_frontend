import api from './api';

export const workspaceService = {
  // Workspaces
  async listWorkspaces() {
    const res = await api.get('/workspaces');
    return res.data.workspaces;
  },

  async createWorkspace(data) {
    const res = await api.post('/workspaces', data);
    return res.data.workspace;
  },

  async getWorkspace(id) {
    const res = await api.get(`/workspaces/${id}`);
    return res.data.workspace;
  },

  async updateWorkspace(id, data) {
    const res = await api.patch(`/workspaces/${id}`, data);
    return res.data.workspace;
  },

  async deleteWorkspace(id) {
    const res = await api.delete(`/workspaces/${id}`);
    return res.data;
  },

  // Files
  async listFiles(workspaceId) {
    const res = await api.get(`/workspaces/${workspaceId}/files`);
    return res.data.files;
  },

  async getFile(workspaceId, fileId) {
    const res = await api.get(`/workspaces/${workspaceId}/files/${fileId}`);
    return res.data.file;
  },

  async createFile(workspaceId, data) {
    const res = await api.post(`/workspaces/${workspaceId}/files`, data);
    return res.data.file;
  },

  async updateFile(workspaceId, fileId, data) {
    const res = await api.patch(`/workspaces/${workspaceId}/files/${fileId}`, data);
    return res.data.file;
  },

  async deleteFile(workspaceId, fileId) {
    const res = await api.delete(`/workspaces/${workspaceId}/files/${fileId}`);
    return res.data;
  },
};
