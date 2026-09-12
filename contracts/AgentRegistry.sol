// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AgentRegistry
 * @dev Verifiable On-Chain Identity Anchor for AgentForge AI Employees.
 * Stores tamper-evident hashes of business agent configurations and knowledge versions
 * without storing any PII or proprietary operational data on-chain.
 */
contract AgentRegistry {
    struct AgentIdentityRecord {
        bytes32 configHash;
        bytes32 knowledgeHash;
        uint256 version;
        uint256 timestamp;
        address owner;
    }

    // Mapping: agentId (UUID string) => AgentIdentityRecord
    mapping(string => AgentIdentityRecord) private _registry;

    event AgentRegistered(
        string indexed agentId,
        bytes32 indexed configHash,
        bytes32 knowledgeHash,
        uint256 version,
        uint256 timestamp,
        address indexed owner
    );

    event AgentUpdated(
        string indexed agentId,
        bytes32 indexed configHash,
        bytes32 knowledgeHash,
        uint256 version,
        uint256 timestamp,
        address indexed owner
    );

    /**
     * @notice Register or update an agent's on-chain identity fingerprint.
     * @param agentId Unique identifier string of the agent.
     * @param configHash keccak256 or sha256 hash of the published system policy and tool configuration.
     * @param knowledgeHash Hash of the approved knowledge chunks fingerprint.
     * @param version Version number of the published configuration.
     */
    function registerAgent(
        string calldata agentId,
        bytes32 configHash,
        bytes32 knowledgeHash,
        uint256 version
    ) external {
        require(bytes(agentId).length > 0, "Agent ID cannot be empty");
        require(configHash != bytes32(0), "Config hash cannot be empty");

        AgentIdentityRecord storage record = _registry[agentId];
        bool isNew = record.timestamp == 0;

        if (!isNew) {
            require(record.owner == msg.sender, "Only owner can update agent");
            require(version > record.version, "Version must be strictly increasing");
        }

        _registry[agentId] = AgentIdentityRecord({
            configHash: configHash,
            knowledgeHash: knowledgeHash,
            version: version,
            timestamp: block.timestamp,
            owner: msg.sender
        });

        if (isNew) {
            emit AgentRegistered(agentId, configHash, knowledgeHash, version, block.timestamp, msg.sender);
        } else {
            emit AgentUpdated(agentId, configHash, knowledgeHash, version, block.timestamp, msg.sender);
        }
    }

    /**
     * @notice Verifies and returns the public fingerprint of an agent.
     * @param agentId Unique identifier string of the agent.
     */
    function getAgent(string calldata agentId) external view returns (
        bytes32 configHash,
        bytes32 knowledgeHash,
        uint256 version,
        uint256 timestamp,
        address owner
    ) {
        AgentIdentityRecord memory record = _registry[agentId];
        require(record.timestamp != 0, "Agent not found");
        return (
            record.configHash,
            record.knowledgeHash,
            record.version,
            record.timestamp,
            record.owner
        );
    }
}
