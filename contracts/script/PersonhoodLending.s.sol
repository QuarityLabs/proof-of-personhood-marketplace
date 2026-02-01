// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {Script} from "forge-std/Script.sol";
import {PersonhoodLending} from "../src/PersonhoodLending.sol";

contract PersonhoodLendingScript is Script {
    PersonhoodLending public personhoodLending;

    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        address protocolTreasury = vm.envAddress("PROTOCOL_TREASURY");
        personhoodLending = new PersonhoodLending(protocolTreasury);

        vm.stopBroadcast();
    }
}
