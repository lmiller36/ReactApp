/* eslint-disable complexity */
/* eslint-disable react/prop-types */

import React from 'react';
import TileIcon from '../../Minesweeper/TileIcon';
import { connect } from 'react-redux';
import styled from 'styled-components';
import {
    getBoard,
    getIsSet,
    getGame,
    plsRerender,
    getGameMode,
    getGameDifficulty,
    isPaused,
    gameOver,
} from '../../selectors';
import { initializeBoard, updateBoard, removeCachedBoard, toggleGameMode, startGame, switchPages, } from '../../actions';

import MinesweeperGame from '../..//Minesweeper/Minesweeper';
import { IN_GAME } from '../../Constants';

let first = true;

const GameWrapper = styled.div`
    display: inline-grid;
    visibility: ${(props) => props.isPaused ? 'hidden' : ''};
    grid-template-columns: repeat(${(props) => props.gameDifficulty ? props.gameDifficulty.cols : 0},1fr);
`;

const Game = ({
    // state
    game, isSet, gameMode, gameDifficulty, isPaused, gameOver,
    // actions
    performInitialSetup, updateBoard, firstClick, toggleGameMode,
}) => {

    if (first && isSet) {
        window.addEventListener('keydown', (event) => {
            if (event.key === 'F' || event.key === 'f') {
                if (gameOver) {
                    return;
                }
                toggleGameMode();
            }
        }, false);
        first = false;
    }

    const initialTileClick = (tile) => {
        const newGame = new MinesweeperGame(gameDifficulty, tile.index);
        performInitialSetup(newGame);
        firstClick();
    };

    const bombClick = () => {
        game.lose();
    };

    const unopenedTileClick = (tile) => {
        game.clickTile(tile);
        updateBoard();
    };

    const flagClick = (tile) => {
        game.flagTile(tile.index);
        updateBoard();
    };

    const openNeighbors = (tile) => {
        game.openNeighbors(tile);
        updateBoard();
    };

    function isClicked(tile) {
        if (tile && tile.isOpened) {
            return true;
        }

        return false;
    }

    return <GameWrapper isPaused={isPaused} gameDifficulty={gameDifficulty}>
        {
            game.board.map((tile) => {
                return <TileIcon
                    key={tile.index}
                    index={tile.index}
                    gameMode={gameMode}
                    click={
                        (tile) => {
                            if (gameOver) {
                                return;
                            }

                            if (!isSet) {
                                initialTileClick(tile);
                                return;
                            }

                            if (isClicked(tile)) {
                                openNeighbors(tile);
                                return;
                            }

                            if (gameMode === 'flagging') {
                                flagClick(tile);
                                return;
                            }

                            if (tile.isFlagged) {
                                return;
                            }
                            if (tile.type === 'bomb') {
                                bombClick(tile);
                                return;
                            }

                            unopenedTileClick(tile);
                        }
                    }
                />;
            })
        }
    </GameWrapper>;
};

const mapStateToProps = (state) => ({
    board: getBoard(state),
    isSet: getIsSet(state),
    game: getGame(state),
    rerender: plsRerender(state),
    gameMode: getGameMode(state),
    gameDifficulty: getGameDifficulty(state),
    isPaused: isPaused(state),
    gameOver: gameOver(state),
});

const mapDispatchToProps = (dispatch) => ({
    performInitialSetup: (newGame) => dispatch(initializeBoard(newGame)),
    firstClick: () => dispatch(switchPages(IN_GAME)),
    updateBoard: () => dispatch(updateBoard()),
    removeCachedBoard: () => dispatch(removeCachedBoard()),
    toggleGameMode: () => dispatch(toggleGameMode()),
    localRemoveCachedBoard: () => dispatch(removeCachedBoard()),
    setDifficulty: (newDifficulty) => dispatch(startGame(newDifficulty)),
});


export default connect(mapStateToProps, mapDispatchToProps)(Game);