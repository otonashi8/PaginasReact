package com.example.ezzeta.data.repository

import android.content.Context
import com.example.ezzeta.data.model.BlockedWord
import com.google.gson.reflect.TypeToken
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow

object BlockedWordRepository {
    private val _blockedWords = MutableStateFlow<List<BlockedWord>>(emptyList())
    val blockedWords: StateFlow<List<BlockedWord>> = _blockedWords.asStateFlow()

    private const val BLOCKED_WORDS_FILE = "blocked_words.json"

    fun init(context: Context) {
        val type = object : TypeToken<List<BlockedWord>>() {}.type
        val loaded: List<BlockedWord>? = LocalJsonStorage.loadFromFile(context, BLOCKED_WORDS_FILE, type)
        if (loaded != null) {
            _blockedWords.value = loaded
        }
    }

    fun addWord(context: Context, word: BlockedWord): Boolean {
        val current = _blockedWords.value.toMutableList()
        if (current.any { it.word.equals(word.word, ignoreCase = true) }) return false
        
        current.add(word)
        _blockedWords.value = current
        LocalJsonStorage.saveToFile(context, BLOCKED_WORDS_FILE, current)
        return true
    }

    fun updateWord(context: Context, word: BlockedWord): Boolean {
        val current = _blockedWords.value.toMutableList()
        val index = current.indexOfFirst { it.id == word.id }
        if (index != -1) {
            // Check for duplicates (excluding itself)
            if (current.any { it.id != word.id && it.word.equals(word.word, ignoreCase = true) }) return false
            
            current[index] = word
            _blockedWords.value = current
            LocalJsonStorage.saveToFile(context, BLOCKED_WORDS_FILE, current)
            return true
        }
        return false
    }

    fun deleteWord(context: Context, wordId: String) {
        val current = _blockedWords.value.filter { it.id != wordId }
        _blockedWords.value = current
        LocalJsonStorage.saveToFile(context, BLOCKED_WORDS_FILE, current)
    }

    fun getWordsSync(): List<BlockedWord> = _blockedWords.value
}
