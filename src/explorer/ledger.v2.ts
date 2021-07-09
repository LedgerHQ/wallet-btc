import LedgerExplorer from './ledgerexplorer';

// an Live explorer V2 class
class LedgerV2 extends LedgerExplorer {
  constructor({ explorerURI, disableBatchSize }: { explorerURI: string; disableBatchSize?: boolean }) {
    super({ explorerURI, disableBatchSize });
    this.httpParams = {
      noToken: 'true',
    };
  }
}

export default LedgerV2;
