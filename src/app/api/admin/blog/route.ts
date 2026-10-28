// Keep the initial admin publishing endpoint compatible while blog writes use the shared /api/blog resource.
export { POST, DELETE } from '../../blog/route';
