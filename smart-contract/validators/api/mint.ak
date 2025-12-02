use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction, Input}

validator one_shot(tx_hash: ByteArray, output_index: Int, _token_name: ByteArray) {

  mint(_redeemer: Void, _policy_id: ByteArray, transaction: Transaction) {
    
    let Transaction { inputs, .. } = transaction

    list.any(inputs, fn(input) {
      let Input { output_reference, .. } = input
      
      output_reference.transaction_id == tx_hash && 
      output_reference.output_index == output_index
    })
  }
}