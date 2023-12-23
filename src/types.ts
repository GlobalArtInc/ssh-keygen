type KeyType = 'rsa' | 'dsa' | 'ecdsa' | 'ecdsa-sk' | 'ed25519';
type KeyFormat = 'PEM' | 'PKCS8' | 'RFC4716';

export type GenerateOptions = {
  location?: string;
  comment?: string;
  password?: string;
  size?: string;
  read?: boolean;
  force?: boolean;
  destroy?: boolean;
  format?: KeyFormat;
  type?: KeyType;
};
