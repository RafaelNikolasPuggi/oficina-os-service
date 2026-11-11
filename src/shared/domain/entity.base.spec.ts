import { Entity } from './entity.base';

class EntidadeDeTeste extends Entity {
  constructor(id: string) {
    super(id);
  }
}

describe('Entity', () => {
  it('equals é true para entidades do mesmo id', () => {
    const a = new EntidadeDeTeste('id-1');
    const b = new EntidadeDeTeste('id-1');

    expect(a.equals(b)).toBe(true);
  });

  it('equals é false para ids diferentes', () => {
    const a = new EntidadeDeTeste('id-1');
    const b = new EntidadeDeTeste('id-2');

    expect(a.equals(b)).toBe(false);
  });

  it('equals é false quando comparado com undefined ou algo que não é Entity', () => {
    const a = new EntidadeDeTeste('id-1');

    expect(a.equals(undefined)).toBe(false);
    expect(a.equals({ _id: 'id-1' } as never)).toBe(false);
  });
});
