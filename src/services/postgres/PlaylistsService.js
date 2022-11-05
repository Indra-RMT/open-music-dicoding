const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
// const { mapDBToModel } = require('../../utils');
// const NotFoundError = require('../../exceptions/NotFoundError');

const TABLE_PLAYLISTS = 'playlists';

class PlaylistsService {
  constructor() {
    this._pool = new Pool();
  }

  async addPlaylist({ name, userId }) {
    const playlistId = `playlist-${nanoid(16)}`;
    const created_at = new Date().toISOString();
    const updated_at = created_at;

    const query = {
      text: `INSERT INTO ${TABLE_PLAYLISTS} values($1, $2, $3, $4, $5) RETURNING id`,
      values: [
        playlistId,
        name,
        userId,
        created_at,
        updated_at,
      ],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan');
    }

    return result.rows[0].id;
  }
}

module.exports = PlaylistsService;
