use aiken/collection/list
use cardano/transaction.{OutputReference, Transaction, Input}
use aiken/crypto.{VerificationKeyHash}

// We define the farmers union address statically (user to validate it the person have the right to mint)
// address addr_test1qzxpp07tfye3mmun65wr3e8npj5etp2lrg802rrjgffttx3u33d6t2t2hxvu0h50q3jwfq6ykqw7ex8mkslpn5rqdu6qugnqpk
const farmers_union_pkh: VerificationKeyHash =
  #"8c10bfcb49331def93d51c38e4f30ca995855f1a0ef50c724252b59a" 

validator one_shot(
  tx_hash: ByteArray,
  output_index: Int,
  _token_name: ByteArray,
) {
  mint(_redeemer: Void, _policy_id: ByteArray, transaction: Transaction) {
    let Transaction { inputs, extra_signatories, .. } = transaction

    // Rule 1: One-Shot UTxO Check
    let is_utxo_consumed =
      list.any(
        inputs,
        fn(input) {
          let Input { output_reference, .. } = input
          output_reference.transaction_id == tx_hash && output_reference.output_index == output_index
        },
      )

    // Rule 2: Authorized Signer Check (using the const)
    let is_authorized_signer =
      list.has(extra_signatories, farmers_union_pkh)

    is_utxo_consumed && is_authorized_signer
  }
}