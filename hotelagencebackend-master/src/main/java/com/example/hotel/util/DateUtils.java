package com.example.hotel.util;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

public final class DateUtils {

    private static final DateTimeFormatter ISO = DateTimeFormatter.ISO_LOCAL_DATE;

    private DateUtils() {
    }

    public static LocalDate parse(String value) {
        return LocalDate.parse(value, ISO);
    }

    public static String format(LocalDate value) {
        return value.format(ISO);
    }
}
